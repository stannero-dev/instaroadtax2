import "@/App.css";
import { HashRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import InquiryForm from "@/pages/InquiryForm";
import CheckStatus from "@/pages/CheckStatus";
import PaymentPage from "@/pages/PaymentPage";
import PaymentResult from "@/pages/PaymentResult";
import AdminDashboard from "@/pages/AdminDashboard";
import StaffPanelAccess from "@/pages/StaffPanelAccess";

function App() {
  return (
    <div className="App min-h-screen bg-white">
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-quote" element={<InquiryForm />} />
          <Route path="/check-status" element={<CheckStatus />} />
          <Route path="/payment/:inquiryId" element={<PaymentPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/admin" element={<Navigate to="/staff-panel" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/staff-panel/dashboard" replace />} />
          <Route path="/staff-panel" element={<StaffPanelAccess />} />
          <Route path="/staff-panel/dashboard" element={<AdminDashboard />} />
        </Routes>
      </HashRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
