import axios from "axios";
import supabase from "../../src/config/supabaseClient.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userName = `${req.user?.first_name || ""} ${req.user?.last_name || ""}`.trim() || "Donor";

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!amount || !campaignId) {
      return res.status(400).json({ error: "Amount and campaign ID are required" });
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, schools(name)")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: paymentOrder, error: paymentError } = await supabase
      .from("payment_orders")
      .insert([{
        order_id: orderId,
        campaign_id: campaignId,
        user_id: userId,
        amount: parseFloat(amount),
        currency: "INR",
        payment_status: "pending",
        return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`,
      }])
      .select()
      .single();

    if (paymentError) {
      return res.status(500).json({ error: "Failed to create payment order" });
    }

    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount).toFixed(2),
      order_currency: "INR",
      order_note: `Donation for ${campaign.title} - ${campaign.schools.name}`,
      customer_details: {
        customer_id: userId,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      },
    };

    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      orderData,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      paymentSessionId: cashfreeResponse.data.payment_session_id,
      orderId: cashfreeResponse.data.order_id,
      orderAmount: cashfreeResponse.data.order_amount,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create payment order",
      details: error.response?.data?.message || error.message,
    });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    if (
      (webhookData.type === "PAYMENT_SUCCESS_WEBHOOK" || webhookData.type === "PAYMENT_CHARGES_WEBHOOK") &&
      webhookData.data
    ) {
      const orderId = webhookData.data.order?.order_id;
      const orderAmount = webhookData.data.order?.order_amount;
      const paymentStatus = webhookData.data.payment?.payment_status;
      const transactionId = webhookData.data.payment?.cf_payment_id;
      const paymentMethod = webhookData.data.payment?.payment_group;

      if (paymentStatus === "SUCCESS" && orderId) {
        const { data: paymentOrder, error: orderError } = await supabase
          .from("payment_orders")
          .select("campaign_id, user_id")
          .eq("order_id", orderId)
          .single();

        if (orderError || !paymentOrder) {
          return res.status(200).json({ received: true, error: "Order not found" });
        }

        await handleSuccessfulPayment({
          orderId,
          orderAmount,
          transactionId,
          paymentMethod,
          campaignId: paymentOrder.campaign_id,
          userId: paymentOrder.user_id,
        });
      }
    }

    res.status(200).json({ received: true, status: "Webhook processed successfully" });
  } catch (error) {
    res.status(200).json({
      received: true,
      status: "Webhook received (processing error)",
      error: error.message,
    });
  }
};

const handleSuccessfulPayment = async (paymentData) => {
  const { orderId, orderAmount, transactionId, paymentMethod, campaignId, userId } = paymentData;

  try {
    const { data: paymentOrder, error: orderError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (orderError || !paymentOrder) {
      throw new Error("Payment order not found");
    }

    if (paymentOrder.payment_status === "success") {
      return;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", userId)
      .single();

    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert([{
        campaign_id: campaignId,
        donor_user_id: userId,
        donor_name: user ? `${user.first_name} ${user.last_name}`.trim() : "Donor",
        donor_email: user?.email || "",
        amount: parseFloat(orderAmount),
        currency: "INR",
        payment_provider: "cashfree",
        provider_payment_id: transactionId,
        status: "completed",
      }])
      .select()
      .single();

    if (donationError) {
      throw donationError;
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("current_amount, currency")
      .eq("id", campaignId)
      .single();

    if (!campaignError && campaign) {
      const currentAmount = parseFloat(campaign.current_amount) || 0;
      const donationAmount = parseFloat(orderAmount);
      const newAmount = currentAmount + donationAmount;

      const { error: updateCampaignError } = await supabase
        .from("campaigns")
        .update({
          current_amount: newAmount.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
    }

    const { error: updateError } = await supabase
      .from("payment_orders")
      .update({
        donation_id: donation.id,
        payment_status: "success",
        transaction_id: transactionId,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    throw error;
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: paymentOrder, error: dbError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (dbError || !paymentOrder) {
      return res.status(404).json({ error: "Payment order not found" });
    }

    if (paymentOrder.payment_status === "success") {
      return res.json({
        order: {
          order_id: paymentOrder.order_id,
          order_amount: paymentOrder.amount,
        },
        latestPayment: {
          payment_status: "SUCCESS",
          cf_payment_id: paymentOrder.transaction_id,
        },
      });
    }

    try {
      const response = await axios.get(
        `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`,
        {
          headers: {
            "x-client-id": process.env.CASHFREE_APP_ID,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY,
            "x-api-version": "2022-09-01",
          },
        }
      );

      const payments = response.data;
      const latestPayment = payments && payments.length > 0 ? payments[0] : null;

      res.json({
        order: {
          order_id: orderId,
          order_amount: paymentOrder.amount,
        },
        payments: payments,
        latestPayment: latestPayment,
      });
    } catch (cashfreeError) {
      res.json({
        order: {
          order_id: orderId,
          order_amount: paymentOrder.amount,
        },
        latestPayment: {
          payment_status: paymentOrder.payment_status.toUpperCase() || "PENDING",
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to get payment status",
      details: error.message,
    });
  }
};