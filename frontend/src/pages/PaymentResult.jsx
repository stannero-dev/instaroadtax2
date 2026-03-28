import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api";
import axios from "axios";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const paymentId = searchParams.get("payment_id");
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status");
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(`${API}/payments/${paymentId}/verify`, null, {
          params: sessionId ? { session_id: sessionId } : undefined,
        });
        setPayment(response.data);
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [paymentId, sessionId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-900">Verifying payment...</p>
        </div>
      </div>
    );
  }
  
  const resolvedStatus = payment?.status || status;
  const isSuccess = resolvedStatus === "paid" || status === "success";
  const isCancelled = resolvedStatus === "cancelled" || status === "cancelled";
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8" data-testid="payment-result-page">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your payment has been received. We will process your insurance and road tax shortly.
              </p>
              
              {payment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-gray-900 font-mono text-sm">{payment.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="text-green-600 font-semibold">RM {payment.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="status-badge status-paid">Paid</span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-500 text-sm mb-6">
                A confirmation will be sent to your email and WhatsApp.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" data-testid="btn-download-receipt">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full border-gray-300" data-testid="btn-back-home">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isCancelled ? "Payment Cancelled" : "Payment Failed"}
              </h1>
              <p className="text-gray-600 mb-6">
                {isCancelled
                  ? "Your Stripe checkout was cancelled before payment was completed."
                  : "Your payment could not be processed. Please try again."}
              </p>
              
              <div className="flex flex-col gap-3">
                <Link to="/check-status" className="w-full">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" data-testid="btn-try-again">
                    Try Again
                  </Button>
                </Link>
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full border-gray-300" data-testid="btn-back-home-fail">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
