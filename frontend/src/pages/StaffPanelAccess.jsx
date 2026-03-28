import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_instant-roadtax/artifacts/kuquahg0_insta%20logo.jpg";

const StaffPanelAccess = () => {
  const navigate = useNavigate();

  const handleEnterPanel = () => {
    sessionStorage.setItem("staffPanelAccess", "true");
    navigate("/staff-panel/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={LOGO_URL} alt="InstaRoadTax" className="w-12 h-12 rounded-lg" />
            <span className="text-xl font-bold text-indigo-600">Instaroadtax.my</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Staff Panel</h1>
          <p className="text-slate-500 mb-8">
            Use this alternate admin entry to open the internal dashboard directly.
          </p>

          <Button
            type="button"
            onClick={handleEnterPanel}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6"
          >
            Open Staff Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffPanelAccess;
