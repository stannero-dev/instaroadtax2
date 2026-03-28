import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CreditCard, ChevronLeft, Loader2, ShieldCheck, Lock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API } from "@/lib/api";
import axios from "axios";

const PaymentPage = () => {
  const { inquiryId } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const response = await axios.get(`${API}/inquiries/${inquiryId}`);
        setInquiry(response.data);
        
        if (response.data.status !== "quoted") {
          toast.error("This inquiry does not have a quotation yet");
        }
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        toast.error("Failed to load inquiry details");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);
  
  const handlePayment = async () => {
    if (!inquiry?.quotation) {
      toast.error("No quotation available");
      return;
    }
    
    setProcessing(true);
    
    try {
      const paymentResponse = await axios.post(`${API}/payments/create`, {
        inquiry_id: inquiryId,
        amount: inquiry.quotation.total_amount,
        currency: "MYR",
        return_url: `${window.location.origin}/#/payment-result`
      });
      
      if (paymentResponse.data.success && paymentResponse.data.payment_url) {
        toast.info("Redirecting to payment gateway...");
        window.location.href = paymentResponse.data.payment_url;
        return;
      }

      throw new Error("Payment URL was not returned by the server");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.detail || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }
  
  if (!inquiry || !inquiry.quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">No quotation available</p>
          <Link to="/check-status">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">Check Status</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const quotation = inquiry.quotation;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 py-8" data-testid="payment-page">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/check-status" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-500">Review and pay for your insurance</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Vehicle</span>
                <span className="text-gray-900 font-medium flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  {inquiry.vehicle_info?.vehicle_number}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Insurance Provider</span>
                <span className="text-gray-900 font-medium">{quotation.insurance_provider}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Coverage</span>
                <span className="text-gray-900 font-medium capitalize">{quotation.coverage_type?.replace(/_/g, " ")}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Sum Insured</span>
                <span className="text-gray-900 font-medium">RM {quotation.sum_insured?.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Premium</span>
                <span className="text-gray-900">RM {quotation.premium_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Road Tax</span>
                <span className="text-gray-900">RM {quotation.road_tax_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-700 text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-indigo-600">RM {quotation.total_amount?.toFixed(2)}</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 justify-center">
            <Lock className="w-4 h-4" />
            <span>Secure payment</span>
          </div>

          <p className="text-center text-xs text-gray-500 mb-6">
            Stripe sandbox checkout will open in test mode for card payment.
          </p>
          
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg"
            data-testid="btn-pay-now"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay Now - RM {quotation.total_amount?.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
