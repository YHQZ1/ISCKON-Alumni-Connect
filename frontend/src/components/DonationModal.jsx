/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { X, Heart, IndianRupee, Loader } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const DonationModal = ({ isOpen, onClose, campaign, school }) => {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (isOpen && !window.Cashfree) {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.defer = true;
      script.onload = () => setCashfreeLoaded(true);
      document.head.appendChild(script);
    }
  }, [isOpen]);

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setAmount(value);
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }

    if (!window.Cashfree) {
      setError("Payment system is loading. Please try again in a moment.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("jwtToken");
      
      const response = await axios.post(
        `${BASE_URL}/api/payments/create-order`,
        {
          amount: parseFloat(amount),
          campaignId: campaign.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success && response.data.paymentSessionId) {
        redirectToCashFree(response.data.paymentSessionId);
      } else {
        throw new Error("Failed to create payment order");
      }

    } catch (err) {
      setError(
        err.response?.data?.error || 
        "Failed to process donation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const redirectToCashFree = (paymentSessionId) => {
    if (!window.Cashfree) {
      setError("Payment system not ready. Please refresh and try again.");
      return;
    }

    const cashfree = window.Cashfree({
      mode: "sandbox"
    });
    
    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: "_self"
    });
  };

  const handleClose = () => {
    setAmount("");
    setCustomAmount("");
    setError("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md mx-auto shadow-xl transform transition-all">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Make a Donation</h2>
              <p className="text-sm text-gray-600">Support {school?.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">{campaign?.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {campaign?.short_description || "Support this important initiative"}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Donation Amount
          </label>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => handleAmountSelect(preset)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                  amount === preset.toString()
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-800 focus:outline-none transition-colors"
                min="1"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!window.Cashfree && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-600 flex items-center">
                <Loader className="h-3 w-3 animate-spin mr-2" />
                Loading payment system...
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDonate}
              disabled={loading || !amount || !window.Cashfree}
              className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  <span>Donate ₹{amount}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;