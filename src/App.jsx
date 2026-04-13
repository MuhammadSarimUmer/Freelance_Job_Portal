import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginSignup from "./pages/LoginSignup";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import JobListings from "./pages/JobListings";
import PostContract from "./pages/PostContract";
import DeveloperProfile from "./pages/DeveloperProfile";
import BugReports from "./pages/BugReports";
import Milestones from "./pages/Milestones";
import Earnings from "./pages/Earnings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/post-contract" element={<PostContract />} />
        <Route path="/developer/profile" element={<DeveloperProfile />} />
        <Route path="/bug-reports" element={<BugReports />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
