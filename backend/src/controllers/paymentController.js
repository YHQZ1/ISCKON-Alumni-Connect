// src/controllers/paymentController.js
import axios from "axios";

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === "PROD" 
  ? "https://api.cashfree.com/pg" 
  : "https://sandbox.cashfree.com/pg";

export const createPaymentOrder = async (req, res) => {
  try {
    console.log("💰 [Payment] Creating order with data:", req.body);
    
    const { amount, campaign_id, institution_id, donor_name, donor_email, donor_phone } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Generate unique order ID
    const order_id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
      order_id: order_id,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Donation for ${campaign_id ? 'campaign ' + campaign_id : 'institution ' + institution_id}`,
      customer_details: {
        customer_id: donor_email || `donor_${Date.now()}`,
        customer_name: donor_name || "Anonymous Donor",
        customer_email: donor_email,
        customer_phone: donor_phone,
      },
      order_meta: {
        return_url: `https://isckon-alumni-connect.vercel.app/payment/callback?order_id={order_id}`,
      }
    };

    console.log("💰 [Payment] Sending to Cashfree:", paymentData);

    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, paymentData, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      },
      timeout: 30000
    });

    console.log("💰 [Payment] Cashfree response:", response.data);

    res.json({
      success: true,
      order_id: order_id,
      payment_session_id: response.data.payment_session_id,
      order_amount: amount,
      payment_url: response.data.payment_link || null
    });

  } catch (error) {
    console.error("💰 [Payment] Order creation error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Payment order creation failed",
      details: error.response?.data || error.message 
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const response = await axios.get(`${CASHFREE_BASE_URL}/orders/${order_id}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      }
    });

    const paymentStatus = response.data.order_status;

    if (paymentStatus === "PAID") {
      res.json({ 
        success: true, 
        status: "success",
        order_id: order_id,
        message: "Payment successful"
      });
    } else {
      res.json({ 
        success: false, 
        status: "failed",
        order_id: order_id,
        message: "Payment failed or pending"
      });
    }

  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Payment verification failed",
      details: error.response?.data || error.message 
    });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("💰 [Webhook] Received:", webhookData);

    if (webhookData.data && webhookData.data.order && webhookData.data.order.order_id) {
      const order_id = webhookData.data.order.order_id;
      const status = webhookData.data.order.order_status;

      if (status === "PAID") {
        console.log(`✅ [Webhook] Payment successful for order: ${order_id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};