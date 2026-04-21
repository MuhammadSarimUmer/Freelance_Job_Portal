import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import SectionHeader from "../components/ui/SectionHeader";
import FormField from "../components/ui/FormField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { profileService } from "../api/services/profileService";
import { skillsService } from "../api/services/skillsService";
import { uploadService } from "../api/services/uploadService";
import { normalizeTechName } from "../utils/techName";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function ProfileSettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshMe, logout } = useAuth();
  const roleLower = useMemo(() => user?.role?.toLowerCase() || null, [user?.role]);
  const isDeveloper = roleLower === "developer";
  const isClient = roleLower === "client";

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    hourlyRate: "",
    portfolioURL: "",
    companyName: "",
    billingAddress: "",
    country: "",
    availabilityStatus: "AVAILABLE",
    experienceYears: "",
  });

  const [skills, setSkills] = useState([]); // [{ techID, techName, proficiencyLevel, yearsExperience }]
  const [allTechnologies, setAllTechnologies] = useState([]);
  const [techLoading, setTechLoading] = useState(false);

  const [selectedTechID, setSelectedTechID] = useState("");
  const [addProficiencyLevel, setAddProficiencyLevel] = useState("BEGINNER");
  const [addYearsExperience, setAddYearsExperience] = useState("");
  const [newTechName, setNewTechName] = useState("");
  const [newTechCategory, setNewTechCategory] = useState("");
  const [isCreatingTech, setIsCreatingTech] = useState(false);

  const [skillsProcessingTechID, setSkillsProcessingTechID] = useState(null);
  const [draftSkillEdits, setDraftSkillEdits] = useState({}); // { [techID]: { proficiencyLevel, yearsExperience } }

  const [isSaving, setIsSaving] = useState(false);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [removeCv, setRemoveCv] = useState(false);
  const [removePortfolio, setRemovePortfolio] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const [portfolioUploadFile, setPortfolioUploadFile] = useState(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [confirmDeleteAccountOpen, setConfirmDeleteAccountOpen] = useState(false);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("");
  const [portfolioPreviewUrl, setPortfolioPreviewUrl] = useState("");
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");

  const hasCv = Boolean(user?.developer?.cvUrl);
  const hasPortfolio = Boolean(user?.developer?.portfolioURL);

  const isImageUrl = (url) => /\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(url || "");
  const isPdfUrl = (url) => /\.pdf(\?.*)?$/i.test(url || "");

  const hydrateFromUser = () => {
    if (!user) return;

    if (isDeveloper) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        hourlyRate: user.developer?.hourlyRate?.toString?.() ?? "",
        portfolioURL: user.developer?.portfolioURL || "",
        companyName: "",
        billingAddress: "",
        country: "",
        availabilityStatus: user.developer?.availabilityStatus || "AVAILABLE",
        experienceYears: user.developer?.experienceYears?.toString?.() ?? "",
      });
      const knownTechs = user.developer?.knownTechs || [];
      setSkills(
        knownTechs
          .map((kt) => ({
            techID: kt.techID,
            techName: normalizeTechName(kt.tech?.techName || kt.tech?.name || kt.techID || "Unknown"),
            proficiencyLevel: kt.proficiencyLevel,
            yearsExperience: kt.yearsExperience ?? 0,
          }))
          .filter((x) => Boolean(x.techID))
      );
      setDraftSkillEdits({});
      return;
    }

    if (isClient) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        hourlyRate: "",
        portfolioURL: "",
        companyName: user.client?.companyName || "",
        billingAddress: user.client?.billingAddress || "",
        country: user.client?.country || "",
        availabilityStatus: "AVAILABLE",
        experienceYears: "",
      });
      setSkills([]);
      setDraftSkillEdits({});
    }
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (removeProfileImage) {
      addToast("Disable 'Remove profile image' before uploading a new file.", "error");
      e.target.value = "";
      setProfileImageFile(null);
      return;
    }
    setProfileImageFile(file);
  };

  const handleToggleRemoveImage = (next) => {
    const enabled = Boolean(next);
    if (enabled && profileImageFile) {
      addToast("Cannot upload and remove a profile image in the same request.", "error");
      return;
    }
    setRemoveProfileImage(enabled);
    if (!enabled) {
      // Keep file selection as-is (user may uncheck to re-upload).
      return;
    }
    // When enabling removal, ensure no file is pending.
    setProfileImageFile(null);
  };

  const handleToggleRemoveCv = (next) => {
    const enabled = Boolean(next);
    if (enabled && cvFile) {
      addToast("Cannot upload and remove a CV in the same request.", "error");
      return;
    }
    setRemoveCv(enabled);
    if (enabled) {
      setCvFile(null);
    }
  };

  const handleToggleRemovePortfolio = (next) => {
    const enabled = Boolean(next);
    if (enabled && portfolioUploadFile) {
      addToast("Cannot upload and remove a portfolio asset in the same request.", "error");
      return;
    }
    setRemovePortfolio(enabled);
    if (enabled) {
      setPortfolioUploadFile(null);
    }
  };

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(profileImageFile);
    setProfileImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  useEffect(() => {
    if (!portfolioUploadFile || !portfolioUploadFile.type?.startsWith("image/")) {
      setPortfolioPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(portfolioUploadFile);
    setPortfolioPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [portfolioUploadFile]);

  useEffect(() => {
    if (!cvFile || !cvFile.type?.startsWith("image/")) {
      setCvPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(cvFile);
    setCvPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cvFile]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedTechID) {
      addToast("Select a technology to add.", "error");
      return;
    }
    setSkillsProcessingTechID("add");
    try {
      const payload = {
        techID: selectedTechID,
        proficiencyLevel: addProficiencyLevel,
      };
      if (addYearsExperience.trim() !== "") {
        const years = parseInt(addYearsExperience, 10);
        if (Number.isNaN(years) || years < 0 || years > 50) {
          addToast("Years of experience must be between 0 and 50.", "error");
          return;
        }
        payload.yearsExperience = years;
      }

      await skillsService.addSkill(payload);
      addToast("Skill added successfully.", "success");
      setSelectedTechID("");
      setAddYearsExperience("");
      setAddProficiencyLevel("BEGINNER");
      setDraftSkillEdits({});
      void refreshMe();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to add skill.", "error");
    } finally {
      setSkillsProcessingTechID(null);
    }
  };

  const handleCreateTechnology = async (e) => {
    e.preventDefault();
    if (!newTechName.trim()) {
      addToast("Enter a technology name.", "error");
      return;
    }
    if (!newTechCategory.trim()) {
      addToast("Enter a category for the technology.", "error");
      return;
    }

    setIsCreatingTech(true);
    try {
      await skillsService.createTechnology({
        techName: newTechName.trim(),
        category: newTechCategory.trim(),
      });
      addToast("Technology added. Select it from the list.", "success");
      setNewTechName("");
      setNewTechCategory("");
      const res = await skillsService.getAllTechnologies();
      const techs = res.data?.data || res.data || [];
      setAllTechnologies(Array.isArray(techs) ? techs : []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to add technology.", "error");
    } finally {
      setIsCreatingTech(false);
    }
  };

  const handleUpdateSkill = async (techID) => {
    const skill = skills.find((s) => s.techID === techID);
    if (!skill) return;
    setSkillsProcessingTechID(techID);

    try {
      const draft = draftSkillEdits[techID] || {};
      const proficiencyLevel = draft.proficiencyLevel || skill.proficiencyLevel;
      const yearsRaw = draft.yearsExperience;
      const yearsExperience =
        yearsRaw === "" || yearsRaw === undefined || yearsRaw === null
          ? skill.yearsExperience
          : parseInt(String(yearsRaw), 10);

      if (Number.isNaN(yearsExperience) || yearsExperience < 0 || yearsExperience > 50) {
        addToast("Years of experience must be between 0 and 50.", "error");
        return;
      }

      await skillsService.updateSkill(techID, {
        proficiencyLevel,
        yearsExperience,
      });

      addToast("Skill updated successfully.", "success");
      setSkills((prev) => prev.map((item) =>
        item.techID === techID
          ? { ...item, proficiencyLevel, yearsExperience }
          : item
      ));
      setDraftSkillEdits((prev) => {
        const next = { ...prev };
        delete next[techID];
        return next;
      });
      void refreshMe();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update skill.", "error");
    } finally {
      setSkillsProcessingTechID(null);
    }
  };

  const handleRemoveSkill = async (techID) => {
    setSkillsProcessingTechID(techID);
    try {
      await skillsService.removeSkill(techID);
      addToast("Skill removed successfully.", "success");
      setSkills((prev) => prev.filter((item) => item.techID !== techID));
      setDraftSkillEdits((prev) => {
        const next = { ...prev };
        delete next[techID];
        return next;
      });
      void refreshMe();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to remove skill.", "error");
    } finally {
      setSkillsProcessingTechID(null);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    hydrateFromUser();
  }, [authLoading, user, isDeveloper, isClient]);

  const handleDiscardChanges = () => {
    hydrateFromUser();
    setSelectedTechID("");
    setAddYearsExperience("");
    setAddProficiencyLevel("BEGINNER");
    setNewTechName("");
    setNewTechCategory("");
    setRemoveProfileImage(false);
    setRemoveCv(false);
    setRemovePortfolio(false);
    setProfileImageFile(null);
    setCvFile(null);
    setPortfolioUploadFile(null);
  };

  useEffect(() => {
    if (authLoading || !user || !isDeveloper) return;
    const fetchTechnologies = async () => {
      setTechLoading(true);
      try {
        const res = await skillsService.getAllTechnologies();
        const techs = res.data?.data || res.data || [];
        setAllTechnologies(Array.isArray(techs) ? techs : []);
      } catch (err) {
        addToast(err?.response?.data?.message || "Failed to load technologies.", "error");
        setAllTechnologies([]);
      } finally {
        setTechLoading(false);
      }
    };
    fetchTechnologies();
  }, [authLoading, user, isDeveloper, addToast]);

  const handleSave = async () => {
    if (authLoading) return;
    if (!user) {
      addToast("Please sign in to update your profile.", "error");
      return;
    }
    if (!isDeveloper && !isClient) {
      addToast("Unable to determine your role for profile update.", "error");
      return;
    }

    // Final conflict check (defense in depth).
    if (removeProfileImage && profileImageFile) {
      addToast("Cannot upload and remove a profile image in the same request.", "error");
      return;
    }
    if (removeCv && cvFile) {
      addToast("Cannot upload and remove a CV in the same request.", "error");
      return;
    }
    if (removePortfolio && portfolioUploadFile) {
      addToast("Cannot upload and remove a portfolio asset in the same request.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();

      if (isDeveloper) {
        if (formData.fullName.trim() !== "") fd.append("fullName", formData.fullName.trim());
        if (formData.phoneNumber.trim() !== "") fd.append("phoneNumber", formData.phoneNumber.trim());
        if (formData.hourlyRate.trim() !== "") fd.append("hourlyRate", formData.hourlyRate.trim());
        if (!removePortfolio && formData.portfolioURL.trim() !== "") fd.append("portfolioURL", formData.portfolioURL.trim());
        if (formData.availabilityStatus) fd.append("availabilityStatus", formData.availabilityStatus);
        if (formData.experienceYears.trim() !== "") fd.append("experienceYears", formData.experienceYears.trim());

        if (removeProfileImage) fd.append("removeProfileImage", "true");
        if (removeCv) fd.append("removeCv", "true");
        if (removePortfolio) fd.append("removePortfolio", "true");
        if (profileImageFile) fd.append("file", profileImageFile);

        await profileService.updateMyDeveloperProfile(fd);
      } else if (isClient) {
        if (formData.fullName.trim() !== "") fd.append("fullName", formData.fullName.trim());
        if (formData.phoneNumber.trim() !== "") fd.append("phoneNumber", formData.phoneNumber.trim());
        if (formData.companyName.trim() !== "") fd.append("companyName", formData.companyName.trim());
        if (formData.billingAddress.trim() !== "") fd.append("billingAddress", formData.billingAddress.trim());
        if (formData.country.trim() !== "") fd.append("country", formData.country.trim());

        if (removeProfileImage) fd.append("removeProfileImage", "true");
        if (profileImageFile) fd.append("file", profileImageFile);

        await profileService.updateMyClientProfile(fd);
      }

      addToast("Profile updated successfully.", "success");
      await refreshMe();
      // Clear file controls after successful update.
      setRemoveProfileImage(false);
      setRemoveCv(false);
      setRemovePortfolio(false);
      setProfileImageFile(null);
    } catch (err) {
      addToast(
        err?.response?.data?.message || "Failed to update profile. Please try again.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCvUpload = async () => {
    if (!isDeveloper || authLoading) return;
    if (removeCv) {
      addToast("Disable 'Remove CV' before uploading a new file.", "error");
      return;
    }
    if (!cvFile) {
      addToast("Select a CV file to upload.", "error");
      return;
    }

    setIsUploadingCv(true);
    try {
      const res = await uploadService.uploadDocument(cvFile);
      const url = res?.data?.url;
      addToast(url ? "CV uploaded successfully." : "CV uploaded.", "success");
      setCvFile(null);
      await refreshMe();
    } catch (err) {
      addToast(err?.response?.data?.message || "CV upload failed.", "error");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!isDeveloper || authLoading) return;
    const nextStatus = formData.availabilityStatus === "AVAILABLE" ? "BUSY" : "AVAILABLE";

    setIsTogglingAvailability(true);
    try {
      await profileService.updateMyDeveloperProfile({ availabilityStatus: nextStatus });
      setFormData((prev) => ({ ...prev, availabilityStatus: nextStatus }));
      await refreshMe();
      addToast("Availability updated.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update availability.", "error");
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handlePortfolioUpload = async () => {
    if (!isDeveloper || authLoading) return;
    if (removePortfolio) {
      addToast("Disable 'Remove portfolio asset' before uploading a new file.", "error");
      return;
    }
    if (!portfolioUploadFile) {
      addToast("Select a portfolio file to upload.", "error");
      return;
    }

    setIsUploadingPortfolio(true);
    try {
      const res = await uploadService.uploadImage(portfolioUploadFile);
      const url = res?.data?.url;
      addToast(url ? "Portfolio uploaded successfully." : "Portfolio uploaded.", "success");
      setPortfolioUploadFile(null);
      await refreshMe();
    } catch (err) {
      addToast(err?.response?.data?.message || "Portfolio upload failed.", "error");
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteMyAccount();
      logout();
      navigate("/");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete account.", "error");
    } finally {
      setConfirmDeleteAccountOpen(false);
    }
  };

  const layoutStyles = `
    .settings-layout {
      min-height: 100vh;
      background-color: var(--color-background);
    }
    .settings-main {
      margin-left: 256px;
      padding: calc(96px + 3rem) 3rem 3rem;
      position: relative;
    }
    .settings-form-container {
      background: var(--color-surface-container-low);
      border-radius: 8px;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }
    .input-field {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--color-outline-variant-strong);
      padding: 1rem 0;
      color: var(--color-on-surface);
      font-size: 1rem;
      outline: none;
      font-family: var(--font-body);
      transition: border-color 0.3s;
    }
    .input-field:focus {
      border-bottom-color: var(--color-primary);
    }
    .form-label {
      display: block;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--color-secondary);
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    @media (max-width: 1024px) {
      .settings-main {
        margin-left: 0;
        padding: 2rem;
      }
    }
  `;

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", background: "var(--color-background)" }}>
        Loading profile settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", background: "var(--color-background)" }}>
        Please sign in to manage your profile.
      </div>
    );
  }

  return (
    <>
      <style>{layoutStyles}</style>
      <div className="settings-layout">
        <Sidebar activePage="Settings" role={roleLower || "developer"} />

        <main className="settings-main anim-fade-in">
          <div
            className="teal-glow"
            style={{
              position: "fixed", top: "10%", right: "-10%", width: "500px", height: "500px", zIndex: 0, opacity: 0.5
            }}
          />
          
          <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
            <SectionHeader
              title="Profile Settings"
              subtitle="Manage your public identity and professional details."
            />

            <div className="settings-form-container">
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                
                {/* GLOBAL FIELDS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <FormField label="Full Name">
                    <input className="input-field" name="fullName" value={formData.fullName} onChange={handleInput} />
                  </FormField>
                  <FormField label="Phone Number">
                    <input className="input-field" name="phoneNumber" value={formData.phoneNumber} onChange={handleInput} />
                  </FormField>
                </div>

                {/* DEVELOPER ONLY FIELDS */}
                {isDeveloper && !authLoading ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                      <FormField label="Hourly Rate ($)">
                        <input
                          type="number"
                          className="input-field"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleInput}
                        />
                      </FormField>
                      <FormField label="Availability Status">
                        <select 
                          className="input-field" 
                          name="availabilityStatus" 
                          value={formData.availabilityStatus} 
                          onChange={handleInput}
                          style={{ WebkitAppearance: "none" }}
                        >
                          <option value="AVAILABLE" style={{ background: "initial" }}>Available for Hire</option>
                          <option value="BUSY" style={{ background: "initial" }}>Busy</option>
                          <option value="UNAVAILABLE" style={{ background: "initial" }}>Not Available</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAvailabilityToggle}
                          disabled={isTogglingAvailability}
                          style={{
                            marginTop: "0.75rem",
                            background: "transparent",
                            border: "1px solid var(--color-outline-variant)",
                            color: "var(--color-on-surface)",
                            padding: "0.6rem 1rem",
                            borderRadius: "4px",
                            cursor: isTogglingAvailability ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            opacity: isTogglingAvailability ? 0.6 : 1,
                          }}
                        >
                          {isTogglingAvailability ? "Updating..." : "Toggle Availability"}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAccountOpen(true)}
                    
                    <FormField label="Portfolio URL">
                      <input type="url" className="input-field" name="portfolioURL" value={formData.portfolioURL} onChange={handleInput} />
                      {hasPortfolio ? (
                        <div style={{ marginTop: "0.75rem" }}>
                          <a
                            href={user?.developer?.portfolioURL}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--color-primary)", fontSize: "0.85rem" }}
                          >
                            View current portfolio
                          </a>
                        </div>
                      ) : null}
                    </FormField>

                    <FormField label="Portfolio Asset" hint="Upload an image/PDF to auto-populate your portfolio URL.">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="input-field"
                        style={{ padding: 0 }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPortfolioUploadFile(file);
                        }}
                        disabled={isUploadingPortfolio || removePortfolio}
                      />
                      <button
                        type="button"
                        onClick={handlePortfolioUpload}
                        disabled={!portfolioUploadFile || isUploadingPortfolio}
                        style={{
                          marginTop: "1rem",
                          background: "var(--color-secondary)",
                          color: "var(--color-on-secondary)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.85rem 1.25rem",
                          cursor: !portfolioUploadFile || isUploadingPortfolio ? "not-allowed" : "pointer",
                          opacity: !portfolioUploadFile || isUploadingPortfolio ? 0.65 : 1,
                          fontFamily: "var(--font-headline)",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {isUploadingPortfolio ? "Uploading..." : "Upload Asset"}
                      </button>
                      {portfolioPreviewUrl || (hasPortfolio && isImageUrl(user?.developer?.portfolioURL)) ? (
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                          <img
                            src={portfolioPreviewUrl || user?.developer?.portfolioURL}
                            alt="Portfolio preview"
                            style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-outline-variant)" }}
                          />
                          <div style={{ fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                            Portfolio preview
                          </div>
                        </div>
                      ) : null}
                      {hasPortfolio && !isImageUrl(user?.developer?.portfolioURL) && !portfolioPreviewUrl ? (
                        <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                          {isPdfUrl(user?.developer?.portfolioURL) ? "Portfolio PDF ready." : "Portfolio link saved."}
                        </div>
                      ) : null}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={removePortfolio}
                          onChange={(e) => handleToggleRemovePortfolio(e.target.checked)}
                        />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface-variant)" }}>
                          Remove portfolio asset
                        </span>
                      </label>
                    </FormField>

                    <FormField label="Profile Image" hint="JPEG, PNG, WebP (max 5MB).">
                      <input
                        type="file"
                        accept="image/*"
                        className="input-field"
                        style={{ padding: 0 }}
                        onChange={handleFileChange}
                        disabled={removeProfileImage}
                      />
                      {profileImagePreviewUrl || user?.profileImageUrl ? (
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                          <img
                            src={profileImagePreviewUrl || user?.profileImageUrl}
                            alt="Profile preview"
                            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--color-outline-variant)" }}
                          />
                          <div style={{ fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                            Profile image preview
                          </div>
                        </div>
                      ) : null}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={removeProfileImage}
                          onChange={(e) => handleToggleRemoveImage(e.target.checked)}
                        />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface-variant)" }}>
                          Remove profile image
                        </span>
                      </label>
                    </FormField>

                    <FormField label="CV / Resume" hint="PDF, PNG, JPG, JPEG, DOCX (max 5MB).">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.docx"
                        className="input-field"
                        style={{ padding: 0 }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setCvFile(file);
                        }}
                        disabled={isUploadingCv || removeCv}
                      />
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                        <button
                          type="button"
                          onClick={handleCvUpload}
                          disabled={!cvFile || isUploadingCv}
                          style={{
                            background: "var(--color-secondary)",
                            color: "var(--color-on-secondary)",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.75rem 1.25rem",
                            cursor: !cvFile || isUploadingCv ? "not-allowed" : "pointer",
                            opacity: !cvFile || isUploadingCv ? 0.65 : 1,
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {isUploadingCv ? "Uploading..." : "Upload CV"}
                        </button>
                        {hasCv ? (
                          <button
                            type="button"
                            onClick={() => window.open(user?.developer?.cvUrl, "_blank", "noopener,noreferrer")}
                            style={{
                              background: "transparent",
                              color: "var(--color-on-surface)",
                              border: "1px solid var(--color-outline-variant)",
                              borderRadius: "4px",
                              padding: "0.75rem 1.25rem",
                              cursor: "pointer",
                              fontFamily: "var(--font-headline)",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            View Current CV
                          </button>
                        ) : null}
                      </div>
                      {cvPreviewUrl || (hasCv && isImageUrl(user?.developer?.cvUrl)) ? (
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                          <img
                            src={cvPreviewUrl || user?.developer?.cvUrl}
                            alt="CV preview"
                            style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--color-outline-variant)" }}
                          />
                          <div style={{ fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                            CV preview
                          </div>
                        </div>
                      ) : null}
                      {hasCv && isPdfUrl(user?.developer?.cvUrl) && !cvPreviewUrl ? (
                        <iframe
                          title="CV preview"
                          src={user?.developer?.cvUrl}
                          style={{ marginTop: "1rem", width: "100%", height: "200px", border: "1px solid var(--color-outline-variant)", borderRadius: "6px" }}
                        />
                      ) : null}
                      {hasCv && !isImageUrl(user?.developer?.cvUrl) && !isPdfUrl(user?.developer?.cvUrl) && !cvPreviewUrl ? (
                        <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                          CV file saved.
                        </div>
                      ) : null}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={removeCv}
                          onChange={(e) => handleToggleRemoveCv(e.target.checked)}
                        />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface-variant)" }}>
                          Remove CV
                        </span>
                      </label>
                    </FormField>

                    <div>
                      <div className="form-label">Technology Skills</div>

                      <form
                        onSubmit={handleCreateTechnology}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.25fr 1fr auto",
                          gap: "1rem",
                          alignItems: "end",
                          marginBottom: "1.25rem",
                        }}
                      >
                        <div>
                          <input
                            className="input-field"
                            placeholder="Add a new technology (e.g. Rust)"
                            value={newTechName}
                            onChange={(e) => setNewTechName(e.target.value)}
                            disabled={isCreatingTech}
                          />
                        </div>
                        <div>
                          <input
                            className="input-field"
                            placeholder="Category (e.g. Backend)"
                            value={newTechCategory}
                            onChange={(e) => setNewTechCategory(e.target.value)}
                            disabled={isCreatingTech}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isCreatingTech}
                          style={{
                            background: "var(--color-surface-container-high)",
                            color: "var(--color-primary)",
                            border: "none",
                            padding: "0 2rem",
                            borderRadius: "4px",
                            cursor: isCreatingTech ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            opacity: isCreatingTech ? 0.65 : 1,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {isCreatingTech ? "Adding..." : "Add Tech"}
                        </button>
                      </form>

                      <form
                        onSubmit={handleAddSkill}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.25fr 0.9fr 0.8fr auto",
                          gap: "1rem",
                          alignItems: "end",
                          marginBottom: "1.25rem",
                        }}
                      >
                        <div>
                          <select
                            className="input-field"
                            value={selectedTechID}
                            onChange={(e) => setSelectedTechID(e.target.value)}
                            disabled={techLoading}
                            style={{ WebkitAppearance: "none" }}
                          >
                            <option value="" disabled style={{ color: "#111", background: "#fff" }}>
                              Select technology...
                            </option>
                            {allTechnologies.map((t) => (
                              <option key={t.techID} value={t.techID} style={{ color: "#111", background: "#fff" }}>
                                {normalizeTechName(t.techName)} ({t.category})
                              </option>
                            ))}
                          </select>
                          {!techLoading && allTechnologies.length === 0 ? (
                            <p style={{ marginTop: "0.5rem", color: "var(--color-secondary)", fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
                              No technologies available yet. Ask an admin to add some.
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <select
                            className="input-field"
                            value={addProficiencyLevel}
                            onChange={(e) => setAddProficiencyLevel(e.target.value)}
                            disabled={techLoading}
                            style={{ WebkitAppearance: "none" }}
                          >
                            <option value="BEGINNER" style={{ background: "initial" }}>Beginner</option>
                            <option value="INTERMEDIATE" style={{ background: "initial" }}>Intermediate</option>
                            <option value="EXPERT" style={{ background: "initial" }}>Expert</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            className="input-field"
                            placeholder="Years (0-50)"
                            value={addYearsExperience}
                            onChange={(e) => setAddYearsExperience(e.target.value)}
                            disabled={techLoading}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={techLoading || skillsProcessingTechID === "add" || !selectedTechID}
                          style={{
                            background: "var(--color-surface-container-high)",
                            color: "var(--color-primary)",
                            border: "none",
                            padding: "0 2rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            opacity: techLoading || skillsProcessingTechID === "add" || !selectedTechID ? 0.65 : 1,
                          }}
                        >
                          {skillsProcessingTechID === "add" ? "Adding..." : "ADD"}
                        </button>
                      </form>

                      {techLoading ? (
                        <p style={{ margin: 0, color: "var(--color-secondary)" }}>Loading technologies...</p>
                      ) : null}

                      {!techLoading && skills.length === 0 ? (
                        <p style={{ margin: 0, color: "var(--color-on-surface-variant)", fontFamily: "var(--font-body)" }}>
                          No skills added yet.
                        </p>
                      ) : null}

                      {skills.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
                          {skills.map((s) => {
                            const draft = draftSkillEdits[s.techID] || {};
                            const proficiencyValue = draft.proficiencyLevel || s.proficiencyLevel;
                            const yearsValue =
                              draft.yearsExperience === ""
                                ? ""
                                : draft.yearsExperience ?? s.yearsExperience ?? "";
                            const yearsInputValue = yearsValue === "" ? "" : String(yearsValue);
                            const isProcessing = skillsProcessingTechID === s.techID;

                            return (
                              <div
                                key={s.techID}
                                style={{
                                  background: "var(--color-surface-container-low)",
                                  border: "1px solid var(--color-outline-variant)",
                                  borderRadius: "8px",
                                  padding: "1.25rem",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                  <div style={{ minWidth: "220px" }}>
                                    <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, color: "var(--color-on-surface)", fontSize: "1.05rem", marginBottom: "0.35rem" }}>
                                      {s.techName}
                                    </div>
                                    <div style={{ color: "var(--color-outline)", fontFamily: "var(--font-body)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                      {proficiencyValue}
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                                    <div>
                                      <select
                                        className="input-field"
                                        value={proficiencyValue}
                                        onChange={(e) =>
                                          setDraftSkillEdits((prev) => ({
                                            ...prev,
                                            [s.techID]: {
                                              ...(prev[s.techID] || {}),
                                              proficiencyLevel: e.target.value,
                                            },
                                          }))
                                        }
                                        disabled={isProcessing}
                                        style={{ WebkitAppearance: "none" }}
                                      >
                                        <option value="BEGINNER" style={{ background: "initial" }}>Beginner</option>
                                        <option value="INTERMEDIATE" style={{ background: "initial" }}>Intermediate</option>
                                        <option value="EXPERT" style={{ background: "initial" }}>Expert</option>
                                      </select>
                                    </div>

                                    <div>
                                      <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        className="input-field"
                                        value={yearsInputValue}
                                        placeholder="Years (0-50)"
                                        onChange={(e) => {
                                          const raw = e.target.value;
                                          setDraftSkillEdits((prev) => ({
                                            ...prev,
                                            [s.techID]: {
                                              ...(prev[s.techID] || {}),
                                              yearsExperience: raw === "" ? "" : parseInt(raw, 10),
                                            },
                                          }));
                                        }}
                                        disabled={isProcessing}
                                      />
                                    </div>

                                    <div style={{ display: "flex", gap: "0.75rem" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateSkill(s.techID)}
                                        disabled={isProcessing}
                                        style={{
                                          background: "var(--color-secondary)",
                                          color: "var(--color-on-secondary)",
                                          border: "none",
                                          borderRadius: "4px",
                                          padding: "0.75rem 1.25rem",
                                          cursor: isProcessing ? "not-allowed" : "pointer",
                                          opacity: isProcessing ? 0.65 : 1,
                                          fontFamily: "var(--font-headline)",
                                          fontWeight: 700,
                                          fontSize: "0.8rem",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                        }}
                                      >
                                        {isProcessing ? "Updating..." : "Update"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(s.techID)}
                                        disabled={isProcessing}
                                        style={{
                                          background: "transparent",
                                          color: "var(--color-error)",
                                          border: "1px solid var(--color-error)",
                                          borderRadius: "4px",
                                          padding: "0.75rem 1.25rem",
                                          cursor: isProcessing ? "not-allowed" : "pointer",
                                          opacity: isProcessing ? 0.65 : 1,
                                          fontFamily: "var(--font-headline)",
                                          fontWeight: 700,
                                          fontSize: "0.8rem",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {/* CLIENT ONLY FIELDS */}
                {isClient && !authLoading ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                      <FormField label="Company Name">
                        <input className="input-field" name="companyName" value={formData.companyName} onChange={handleInput} />
                      </FormField>
                      <FormField label="Country">
                        <input className="input-field" name="country" value={formData.country} onChange={handleInput} />
                      </FormField>
                    </div>
                    <FormField label="Billing Address">
                      <input className="input-field" name="billingAddress" value={formData.billingAddress} onChange={handleInput} />
                    </FormField>

                    <FormField label="Profile Image" hint="JPEG, PNG, WebP (max 5MB).">
                      <input
                        type="file"
                        accept="image/*"
                        className="input-field"
                        style={{ padding: 0 }}
                        onChange={handleFileChange}
                        disabled={removeProfileImage}
                      />
                      {profileImagePreviewUrl || user?.profileImageUrl ? (
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                          <img
                            src={profileImagePreviewUrl || user?.profileImageUrl}
                            alt="Profile preview"
                            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--color-outline-variant)" }}
                          />
                          <div style={{ fontSize: "0.85rem", color: "var(--color-on-surface-variant)" }}>
                            Profile image preview
                          </div>
                        </div>
                      ) : null}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={removeProfileImage}
                          onChange={(e) => handleToggleRemoveImage(e.target.checked)}
                        />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-on-surface-variant)" }}>
                          Remove profile image
                        </span>
                      </label>
                    </FormField>
                  </>
                ) : null}

                <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="signature-cta"
                    style={{
                    padding: "1.25rem 3rem",
                    color: "var(--color-on-primary-container)",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                    opacity: authLoading ? 0.65 : 1,
                    }}
                    disabled={authLoading || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    style={{
                      padding: "1.25rem 2.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--color-outline-variant)",
                      background: "transparent",
                      color: "var(--color-on-surface)",
                      cursor: "pointer",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                    }}
                    disabled={authLoading || isSaving}
                  >
                    Discard Changes
                  </button>
                </div>

                {authLoading ? (
                  <p style={{ color: "var(--color-secondary)", margin: 0 }}>Loading profile...</p>
                ) : null}

                <div style={{ marginTop: "4rem", borderTop: "1px solid var(--color-error)", paddingTop: "2rem" }}>
                  <h3 style={{ fontFamily: "var(--font-headline)", color: "var(--color-error)", marginBottom: "0.5rem" }}>
                    Danger Zone
                  </h3>
                  <p style={{ color: "var(--color-on-surface-variant)", fontSize: 14, marginBottom: "1rem" }}>
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAccountOpen(true)}
                    style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--color-error)", color: "var(--color-error)", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-headline)", fontWeight: 700 }}
                  >
                    Delete My Account
                  </button>
                </div>

                <ConfirmDialog
                  open={confirmDeleteAccountOpen}
                  title="Delete account"
                  message="This will permanently delete your account and all associated data. This action cannot be undone."
                  confirmLabel="Delete account"
                  tone="danger"
                  onConfirm={handleDeleteAccount}
                  onCancel={() => setConfirmDeleteAccountOpen(false)}
                />

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ProfileSettings;
