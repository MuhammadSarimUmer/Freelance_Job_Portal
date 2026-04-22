import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import VerifyEmail from "./pages/VerifyEmail";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import DeveloperDirectory from "./pages/DeveloperDirectory";
import ContractWorkspace from "./pages/ContractWorkspace";
import MyApplications from "./pages/MyApplications";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import JobListings from "./pages/JobListings";
import PostContract from "./pages/PostContract";
import DeveloperProfile from "./pages/DeveloperProfile";
import ClientProfile from "./pages/ClientProfile";
import PublicDeveloperProfile from "./pages/PublicDeveloperProfile";
import ProfileSettings from "./pages/ProfileSettings";
import BugReports from "./pages/BugReports";
import Milestones from "./pages/Milestones";
import Earnings from "./pages/Earnings";
import Escrow from "./pages/Escrow";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentReturn from "./pages/PaymentReturn";
import RoleRoute from "./components/routing/RoleRoute";
import ScrollToTop from "./components/routing/ScrollToTop";
import PageTransition from "./components/routing/PageTransition";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ScrollToTop />
            <Navbar />
            <PageTransition>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<LoginSignup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/developer/dashboard"
                  element={<RoleRoute allow={["DEVELOPER"]}><DeveloperDashboard /></RoleRoute>}
                />
                <Route
                  path="/client/dashboard"
                  element={<RoleRoute allow={["CLIENT"]}><ClientDashboard /></RoleRoute>}
                />
                <Route
                  path="/client/directory"
                  element={<RoleRoute allow={["CLIENT"]}><DeveloperDirectory /></RoleRoute>}
                />
                <Route
                  path="/clients/:id"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><ClientProfile /></RoleRoute>}
                />
                <Route
                  path="/developers/:id"
                  element={<RoleRoute allow={["CLIENT", "DEVELOPER"]}><PublicDeveloperProfile /></RoleRoute>}
                />
                <Route
                  path="/contracts/:id"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><ContractWorkspace /></RoleRoute>}
                />
                <Route
                  path="/applications"
                  element={<RoleRoute allow={["CLIENT"]}><ApplicationsList /></RoleRoute>}
                />
                <Route
                  path="/applications/:id"
                  element={<RoleRoute allow={["CLIENT"]}><ApplicationDetail /></RoleRoute>}
                />
                <Route
                  path="/developer/applications"
                  element={<RoleRoute allow={["DEVELOPER"]}><MyApplications /></RoleRoute>}
                />
                <Route
                  path="/jobs"
                  element={<RoleRoute allow={["DEVELOPER"]}><JobListings /></RoleRoute>}
                />
                <Route
                  path="/post-contract"
                  element={<RoleRoute allow={["CLIENT"]}><PostContract /></RoleRoute>}
                />
                <Route
                  path="/developer/profile"
                  element={<RoleRoute allow={["DEVELOPER"]}><DeveloperProfile /></RoleRoute>}
                />
                <Route
                  path="/settings"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><ProfileSettings /></RoleRoute>}
                />
                <Route
                  path="/bug-reports"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><BugReports /></RoleRoute>}
                />
                <Route
                  path="/milestones"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><Milestones /></RoleRoute>}
                />
                <Route
                  path="/earnings"
                  element={<RoleRoute allow={["DEVELOPER", "CLIENT"]}><Earnings /></RoleRoute>}
                />
                <Route
                  path="/escrow"
                  element={<RoleRoute allow={["CLIENT"]}><Escrow /></RoleRoute>}
                />
                <Route
                  path="/payment/return"
                  element={<RoleRoute allow={["CLIENT"]}><PaymentReturn /></RoleRoute>}
                />
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;