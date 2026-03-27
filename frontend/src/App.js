import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import InquiryForm from "@/pages/InquiryForm";
import CheckStatus from "@/pages/CheckStatus";
import PaymentPage from "@/pages/PaymentPage";
import PaymentResult from "@/pages/PaymentResult";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <div className="App min-h-screen bg-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-quote" element={<InquiryForm />} />
          <Route path="/check-status" element={<CheckStatus />} />
          <Route path="/payment/:inquiryId" element={<PaymentPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
