import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader, ArrowLeft, Heart } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("loading");
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      verifyPaymentStatus();
    } else {
      setPaymentStatus("error");
      setError("No order ID found in URL");
    }
  }, [orderId]);

  const verifyPaymentStatus = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      
      // First, check with our backend
      const response = await axios.get(
        `${BASE_URL}/api/payments/status/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = response.data;
      
      if (paymentData.latestPayment?.payment_status === "SUCCESS") {
        setPaymentStatus("success");
        setOrderDetails({
          orderId: orderId,
          amount: paymentData.order?.order_amount,
          transactionId: paymentData.latestPayment?.cf_payment_id
        });
      } else if (paymentData.latestPayment?.payment_status === "FAILED") {
        setPaymentStatus("failed");
      } else {
        // If status is still pending, wait a bit and check again
        setTimeout(verifyPaymentStatus, 2000);
      }

    } catch (err) {
      console.error("Error verifying payment:", err);
      setPaymentStatus("error");
      setError("Failed to verify payment status");
    }
  };

  const handleRetry = () => {
    navigate("/alumni/home");
  };

  const handleViewCampaigns = () => {
    navigate("/alumni/home");
  };

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200">
          <Loader className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your payment status...
          </p>
          <div className="text-sm text-gray-500">
            Order ID: {orderId}
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for your generous donation. Your support makes a difference.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₹{orderDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-xs">{orderDetails.orderId}</span>
                </div>
                {orderDetails.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{orderDetails.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleViewCampaigns}
              className="w-full bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <Heart className="h-4 w-4" />
              <span>Support More Campaigns</span>
            </button>
            
            <button
              onClick={() => navigate("/alumni/home")}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your payment could not be processed. Please try again.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate("/alumni/home")}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-gray-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something Went Wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error || "Unable to verify payment status. Please check your payment history."}
        </p>

        <button
          onClick={() => navigate("/alumni/home")}
          className="w-full bg-gray-800 text-white py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentCallback;