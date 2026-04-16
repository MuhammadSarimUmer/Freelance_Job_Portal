import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function LoginSignup() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("signup");
  const [selectedRole, setSelectedRole] = useState("developer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "",
    phoneNumber: "",
    profileImage: null,
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleInput = (e) => {
    if (e.target.name === "profileImage") {
      setFormData({ ...formData, profileImage: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const getApiErrorMessage = (err, fallbackMessage) => {
    const apiMessage = err?.response?.data?.message;
    if (apiMessage) return apiMessage;

    const validationMessage = err?.response?.data?.errors?.[0]?.msg;
    if (validationMessage) return validationMessage;

    if (err?.message === "Network Error") {
      return "Cannot reach the server. Make sure the backend is running on port 3000.";
    }

    return fallbackMessage;
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      if (activeTab === "login") {
        const data = await login(formData.email, formData.password);
        addToast("Welcome back!", "success");
        if (data.user.role === "DEVELOPER") navigate("/developer/dashboard");
        else navigate("/client/dashboard");
      } else {
        let payload;
        if (formData.profileImage) {
          payload = new FormData();
          payload.append("fullName", formData.fullName);
          payload.append("email", formData.email);
          payload.append("password", formData.password);
          payload.append("file", formData.profileImage);   // backend Multer expects 'file'
          if (formData.country) payload.append("country", formData.country);
          if (formData.phoneNumber) payload.append("phoneNumber", formData.phoneNumber);
        } else {
          payload = {
            fullName: formData.fullName, email: formData.email,
            password: formData.password, country: formData.country,
            phoneNumber: formData.phoneNumber
          };
        }

        await register(payload, selectedRole.toUpperCase());
        addToast("Registration complete. Initialization successful.", "success");

        if (selectedRole === "developer") {
          navigate("/developer/dashboard");
        } else {
          navigate("/client/dashboard");
        }
      }
    } catch (err) {
      addToast(
        getApiErrorMessage(err, "Operation failed. Please review your details and try again."),
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Inject scoped styles for responsiveness
  const responsiveStyle = `
    .auth-container {
      display: flex;
      flex-direction: row;
    }
    .auth-left, .auth-right {
      width: 50%;
    }
    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
      }
      .auth-left, .auth-right {
        width: 100%;
        min-height: auto;
      }
      .auth-left {
        padding: 3rem 2rem !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyle}</style>
      <style>{`
        @keyframes auth-progress-slide {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(90%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
      <div
        className="auth-container"
        style={{
          backgroundColor: "var(--color-background)",
          minHeight: "100vh",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* LEFT SIDE */}
        <div
          className="auth-left anim-fade-in"
          style={{
            background: "var(--color-surface-container-low)",
            padding: "4rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            minHeight: "100vh",
          }}
        >
          <div
            className="teal-glow"
            style={{
              position: "absolute",
              top: "-100px",
              left: "-100px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            onClick={() => navigate("/")}
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-on-surface)",
              cursor: "pointer",
              letterSpacing: "-0.04em",
              zIndex: 1,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
              }}
            >
              Codex
            </h2>
          </div>

          <div style={{ zIndex: 1, margin: "auto 0" }}>
            <h1
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(3rem, 5vw, 5rem)",
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                color: "var(--color-on-surface)",
                marginBottom: "2rem",
              }}
            >
              CRAFT YOUR
              <br />
              <span style={{ color: "var(--color-primary)" }}>LEGACY</span>
              <br />
              IN CODE.
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--color-secondary)",
                maxWidth: "28rem",
                lineHeight: 1.7,
              }}
            >
              A curated ecosystem where engineering precision meets editorial
              flair.
            </p>

            <div
              style={{
                marginTop: "3rem",
                padding: "2rem",
                borderLeft: "4px solid var(--color-primary)",
                background: "var(--color-surface-container)",
              }}
            >
              <p
                style={{ fontSize: "1.25rem", lineHeight: 1.6, marginBottom: "2rem" }}
              >
                "Codex isn't just a platform; it's a statement of
                engineering intent. Where elite talent builds software that
                matters."</p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--color-surface-container-highest)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    color: "var(--color-secondary)",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                  }}
                >
                  JV
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    Julian Voss
                  </p>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Principal Architect
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-outline)", fontFamily: "var(--font-body)" }}>
              © 2024 Codex
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — Form */}
        <div
          className="auth-right anim-slide-right delay-2"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--color-background)",
          }}
        >
          <div
            style={{ width: "100%", maxWidth: "480px", background: "var(--color-surface-container-low)", borderRadius: "8px", overflow: "hidden", boxShadow: "var(--shadow-card)" }}
          >
            {/* Tab Toggle */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--color-outline-variant)",
              }}
            >
              {["signup", "login"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "var(--font-headline)",
                    transition: "all 0.2s",
                    background: activeTab === tab ? "var(--color-surface-container-highest)" : "transparent",
                    color: activeTab === tab ? "var(--color-primary)" : "var(--color-secondary)",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid var(--color-primary)"
                        : "2px solid transparent",
                  }}
                >
                  {tab === "signup" ? "Sign Up" : "Login"}
                </button>
              ))}
            </div>

            <div style={{ padding: "2.5rem" }}>
              {isProcessing ? (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      height: "4px",
                      width: "100%",
                      background: "var(--color-surface-container-highest)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "45%",
                        background: "var(--color-primary)",
                        borderRadius: "999px",
                        animation: "auth-progress-slide 1.1s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      marginTop: "0.75rem",
                      color: "var(--color-secondary)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {activeTab === "login" ? "Signing you in..." : "Creating your account..."}
                  </p>
                </div>
              ) : null}

              {/* Role Selector */}
              {activeTab === "signup" && (
                <div style={{ marginBottom: "2rem" }}>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "var(--color-secondary)",
                      fontWeight: 700,
                      marginBottom: "1rem",
                    }}
                  >
                    Select Your Path
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    {[
                      {
                        role: "developer",
                        icon: "code",
                        title: "I'm a Developer",
                        sub: "Showcase expertise",
                      },
                      {
                        role: "client",
                        icon: "rocket_launch",
                        title: "I'm a Client",
                        sub: "Hire top talent",
                      },
                    ].map((item) => (
                      <div
                        key={item.role}
                        onClick={() => setSelectedRole(item.role)}
                        style={{
                          padding: "1.5rem",
                          cursor: "pointer",
                          borderRadius: "4px",
                          border:
                            selectedRole === item.role
                              ? "2px solid var(--color-primary-container)"
                              : "2px solid transparent",
                          background:
                            selectedRole === item.role ? "var(--color-surface-container-highest)" : "var(--color-surface-container)",
                          transition: "all 0.2s",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            color:
                              selectedRole === item.role ? "var(--color-primary)" : "var(--color-secondary)",
                            display: "block",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {item.icon}
                        </span>
                        <p
                          style={{
                            fontFamily: "var(--font-headline)",
                            fontWeight: 700,
                            color: "var(--color-on-surface)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--color-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginTop: "0.25rem",
                          }}
                        >
                          {item.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {isForgotPassword ? (
                  <div>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--color-on-surface)" }}>Reset Password</h3>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: "var(--color-secondary)",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="alex@codex.io"
                      value={formData.email}
                      onChange={handleInput}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "2px solid var(--color-outline-variant-strong)",
                        padding: "0.75rem 0",
                        color: "var(--color-on-surface)",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "var(--font-body)",
                        transition: "border-color 0.3s",
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
                    />
                    <button
                      onClick={() => setIsForgotPassword(false)}
                      style={{
                        background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer",
                        marginTop: "1rem", fontSize: "0.85rem", textDecoration: "underline"
                      }}
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    {activeTab === "signup" && (
                      <>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.2em",
                              color: "var(--color-secondary)",
                              fontWeight: 700,
                              marginBottom: "0.5rem",
                            }}
                          >
                            Full Name
                          </label>
                          <input
                            name="fullName"
                            type="text"
                            placeholder="Alex Rivera"
                            value={formData.fullName}
                            onChange={handleInput}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              borderBottom: "2px solid var(--color-outline-variant-strong)",
                              padding: "0.75rem 0",
                              color: "var(--color-on-surface)",
                              fontSize: "1rem",
                              outline: "none",
                              fontFamily: "var(--font-body)",
                              transition: "border-color 0.3s",
                            }}
                            onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                            onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
                          />
                        </div>
                        {selectedRole === "client" && (
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.2em",
                                color: "var(--color-secondary)",
                                fontWeight: 700,
                                marginBottom: "0.5rem",
                              }}
                            >
                              Country
                            </label>
                            <input
                              name="country"
                              type="text"
                              placeholder="e.g. United States"
                              value={formData.country}
                              onChange={handleInput}
                              style={{
                                width: "100%", background: "transparent", border: "none",
                                borderBottom: "2px solid var(--color-outline-variant-strong)",
                                padding: "0.75rem 0", color: "var(--color-on-surface)",
                                fontSize: "1rem", outline: "none", fontFamily: "var(--font-body)",
                                transition: "border-color 0.3s",
                              }}
                              onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                              onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
                            />
                          </div>
                        )}
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.2em",
                              color: "var(--color-secondary)",
                              fontWeight: 700,
                              marginBottom: "0.5rem",
                            }}
                          >
                            Phone Number (Optional)
                          </label>
                          <input
                            name="phoneNumber"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phoneNumber}
                            onChange={handleInput}
                            style={{
                              width: "100%", background: "transparent", border: "none",
                              borderBottom: "2px solid var(--color-outline-variant-strong)",
                              padding: "0.75rem 0", color: "var(--color-on-surface)",
                              fontSize: "1rem", outline: "none", fontFamily: "var(--font-body)",
                              transition: "border-color 0.3s",
                            }}
                            onFocus={(e) => (e.target.style.borderBottomColor = "var(--color-secondary)")}
                            onBlur={(e) => (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")}
                          />
                        </div>
                      </>
                    )}
                    {[
                      {
                        name: "email",
                        type: "email",
                        label: "Email Address",
                        placeholder: "alex@codex.io",
                      },
                      {
                        name: "password",
                        type: "password",
                        label: "Password",
                        placeholder: "••••••••",
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            color: "var(--color-secondary)",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name]}
                          onChange={handleInput}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            borderBottom: "2px solid var(--color-outline-variant-strong)",
                            padding: "0.75rem 0",
                            color: "var(--color-on-surface)",
                            fontSize: "1rem",
                            outline: "none",
                            fontFamily: "var(--font-body)",
                            transition: "border-color 0.3s",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderBottomColor = "var(--color-secondary)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor = "var(--color-outline-variant-strong)")
                          }
                        />
                      </div>
                    ))}
                    {activeTab === "signup" && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            color: "var(--color-secondary)",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                          }}
                        >
                          Profile Picture (Optional)
                        </label>
                        <div style={{ position: "relative", width: "100%", height: "48px", border: "1px solid var(--color-outline-variant-strong)", borderRadius: "4px", background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem", cursor: "pointer", transition: "border-color 0.3s" }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--color-secondary)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant-strong)"}>
                          <span style={{ fontSize: "0.85rem", color: formData.profileImage ? "var(--color-on-surface)" : "var(--color-outline)", fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "85%" }}>
                            {formData.profileImage ? formData.profileImage.name : "Select an image file..."}
                          </span>
                          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "1.2rem" }}>upload_file</span>
                          <input
                            name="profileImage"
                            type="file"
                            accept="image/*"
                            onChange={handleInput}
                            style={{
                              position: "absolute", inset: 0, opacity: 0, cursor: "pointer"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {activeTab === "login" && (
                      <div style={{ textAlign: "right" }}>
                        <button
                          onClick={() => setIsForgotPassword(true)}
                          style={{
                            background: "none", border: "none", color: "var(--color-primary)",
                            cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-headline)",
                            fontWeight: 600
                          }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="signature-cta"
                  style={{
                    width: "100%",
                    padding: "1.25rem",
                    color: "var(--color-on-primary-container)",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    border: "none",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    transition: "filter 0.3s ease",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) =>
                    !isProcessing && (e.target.style.filter = "brightness(1.1)")
                  }
                  onMouseLeave={(e) => !isProcessing && (e.target.style.filter = "brightness(1)")}
                >
                  {isProcessing ? "Authenticating..." : (activeTab === "login" ? "Enter Nexus" : "Initialize Identity")}
                </button>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "var(--color-outline-variant)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "var(--color-outline)",
                    }}
                  >
                    Or continue with
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "var(--color-outline-variant)",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {["GitHub", "LinkedIn"].map((social) => (
                    <button
                      key={social}
                      style={{
                        padding: "0.75rem",
                        border: "1px solid var(--color-outline-variant-strong)",
                        background: "transparent",
                        color: "var(--color-on-surface)",
                        fontFamily: "var(--font-headline)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        borderRadius: "4px",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--color-surface-container-highest)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginSignup;
