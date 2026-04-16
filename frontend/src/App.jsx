import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import DeveloperDirectory from "./pages/DeveloperDirectory";
import ContractWorkspace from "./pages/ContractWorkspace";
import MyApplications from "./pages/MyApplications";
import ApplicationDetail from "./pages/ApplicationDetail";
import JobListings from "./pages/JobListings";
import PostContract from "./pages/PostContract";
import DeveloperProfile from "./pages/DeveloperProfile";
import ClientProfile from "./pages/ClientProfile";
import ProfileSettings from "./pages/ProfileSettings";
import BugReports from "./pages/BugReports";
import Milestones from "./pages/Milestones";
import Earnings from "./pages/Earnings";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<LoginSignup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/directory" element={<DeveloperDirectory />} />
            <Route path="/clients/:id" element={<ClientProfile />} />
            <Route path="/contracts/:id" element={<ContractWorkspace />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/developer/applications" element={<MyApplications />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/post-contract" element={<PostContract />} />
            <Route path="/developer/profile" element={<DeveloperProfile />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/bug-reports" element={<BugReports />} />
            <Route path="/milestones" element={<Milestones />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
