import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ChevronLeft, Car, CheckCircle2, Clock, FileText, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API } from "@/lib/api";
import axios from "axios";

const statusInfo = {
  new: { label: "New", color: "bg-amber-100 text-amber-700", icon: Clock, description: "Your inquiry has been received. We will review it shortly." },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: FileText, description: "Our team is reviewing your inquiry and preparing a quotation." },
  quoted: { label: "Quotation Ready", color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2, description: "Your quotation is ready! Review the details below." },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: CreditCard, description: "Payment received. Your policy is being processed." },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2, description: "Your insurance has been activated." },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600", icon: Clock, description: "This inquiry has been cancelled." }
};

const CheckStatus = () => {
  const location = useLocation();
  const [inquiryId, setInquiryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState(null);
  const [error, setError] = useState(null);
  
  const checkInquiryStatus = async (id) => {
    const normalizedId = id.trim();

    if (!normalizedId) {
      toast.error("Please enter your inquiry ID");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API}/inquiries/check/${normalizedId.toLowerCase()}`);
      setInquiry(response.data);
      setInquiryId(response.data.inquiry_id.toUpperCase());
    } catch (err) {
      console.error("Error checking status:", err);
      if (err.response?.status === 404) {
        setError("Inquiry not found. Please check your inquiry ID.");
      } else {
        setError("Failed to check status. Please try again.");
      }
      setInquiry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const presetInquiryId = params.get("inquiryId");
    if (presetInquiryId) {
      setInquiryId(presetInquiryId.toUpperCase());
      checkInquiryStatus(presetInquiryId.toUpperCase());
    }
  }, [location.search]);

  const handleCheck = async (e) => {
    e.preventDefault();
    await checkInquiryStatus(inquiryId);
  };
  
  const status = inquiry ? statusInfo[inquiry.status] || statusInfo.new : null;
  const StatusIcon = status?.icon || Clock;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 py-8" data-testid="check-status-page">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Inquiry Status</h1>
            <p className="text-gray-500">Enter your inquiry ID to check the status</p>
          </div>
          
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <Label htmlFor="inquiryId" className="text-gray-700">Inquiry ID</Label>
              <Input
                id="inquiryId"
                placeholder="e.g., A1B2C3D4"
                value={inquiryId}
                onChange={(e) => setInquiryId(e.target.value.toUpperCase())}
                className="input-light mt-2"
                data-testid="input-inquiry-id"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
              data-testid="btn-check-status"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
          
          {inquiry && (
            <div className="mt-8 space-y-6" data-testid="inquiry-result">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">{status.label}</span>
                </div>
                <p className="text-gray-600 mt-3">{status.description}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Inquiry ID</span>
                  <span className="text-gray-900 font-mono break-all text-right">{inquiry.inquiry_id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="text-gray-900 font-medium">{inquiry.vehicle_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span className="text-gray-900">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {inquiry.quotation && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-indigo-800 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Your Quotation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Insurance Provider</span>
                      <span className="text-indigo-900 font-medium">{inquiry.quotation.insurance_provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Coverage Type</span>
                      <span className="text-indigo-900 font-medium capitalize">{inquiry.quotation.coverage_type?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Sum Insured</span>
                      <span className="text-indigo-900 font-medium">RM {inquiry.quotation.sum_insured?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Premium</span>
                      <span className="text-indigo-900 font-medium">RM {inquiry.quotation.premium_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Road Tax</span>
                      <span className="text-indigo-900 font-medium">RM {inquiry.quotation.road_tax_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-indigo-200">
                      <span className="text-indigo-800 font-semibold">Total Amount</span>
                      <span className="text-indigo-900 font-bold text-lg">RM {inquiry.quotation.total_amount?.toFixed(2)}</span>
                    </div>
                    {inquiry.quotation.valid_until && (
                      <p className="text-indigo-600 text-xs mt-2">Valid until: {inquiry.quotation.valid_until}</p>
                    )}
                    {inquiry.quotation.remarks && (
                      <div className="pt-2 border-t border-indigo-200">
                        <p className="text-indigo-700 font-medium mb-1">Remarks</p>
                        <p className="text-indigo-900">{inquiry.quotation.remarks}</p>
                      </div>
                    )}
                  </div>
                  
                  {inquiry.status === "quoted" && (
                    <Link to={`/payment/${inquiry.inquiry_id}`} className="block mt-4">
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" data-testid="btn-proceed-payment">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;
