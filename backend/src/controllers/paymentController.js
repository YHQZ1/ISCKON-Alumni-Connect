import axios from "axios";
import supabase from "../../src/config/supabaseClient.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, campaignId } = req.body;

    // Get authenticated user
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userName =
      `${req.user?.first_name || ""} ${req.user?.last_name || ""}`.trim() ||
      "Donor";

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Validate required fields
    if (!amount || !campaignId) {
      return res.status(400).json({
        error: "Amount and campaign ID are required",
      });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, schools(name)")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({
        error: "Campaign not found",
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create payment order record
    const { data: paymentOrder, error: paymentError } = await supabase
      .from("payment_orders")
      .insert([
        {
          order_id: orderId,
          campaign_id: campaignId,
          user_id: userId,
          amount: parseFloat(amount),
          currency: "INR",
          payment_status: "pending",
          return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`,
        },
      ])
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment order:", paymentError);
      return res.status(500).json({
        error: "Failed to create payment order",
      });
    }

    // Prepare order data for Cashfree
    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount).toFixed(2),
      order_currency: "INR",
      order_note: `Donation for ${campaign.title} - ${campaign.schools.name}`,
      customer_details: {
        customer_id: userId,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: "9999999999", // Default for testing
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-callback?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      },
    };

    // Create order in Cashfree
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

    console.log("Cashfree order created:", cashfreeResponse.data);

    res.json({
      success: true,
      paymentSessionId: cashfreeResponse.data.payment_session_id,
      orderId: cashfreeResponse.data.order_id,
      orderAmount: cashfreeResponse.data.order_amount,
    });
  } catch (error) {
    console.error(
      "Payment order creation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to create payment order",
      details: error.response?.data?.message || error.message,
    });
  }
};

// Webhook handler for CashFree payment notifications
export const paymentWebhook = async (req, res) => {
  try {
    console.log("=== CASHFREE WEBHOOK RECEIVED ===");

    const rawBody = req.body.toString();
    const webhookData = JSON.parse(rawBody);

    console.log("Webhook type:", webhookData.type);
    console.log("Webhook data:", JSON.stringify(webhookData, null, 2));

    // Handle payment success webhook
    if (
      (webhookData.type === "PAYMENT_SUCCESS_WEBHOOK" ||
        webhookData.type === "PAYMENT_CHARGES_WEBHOOK") &&
      webhookData.data
    ) {
      const orderId = webhookData.data.order?.order_id;
      const orderAmount = webhookData.data.order?.order_amount;
      const paymentStatus = webhookData.data.payment?.payment_status;
      const transactionId = webhookData.data.payment?.cf_payment_id;
      const paymentMethod = webhookData.data.payment?.payment_group;

      console.log("Processing payment webhook:", {
        orderId,
        orderAmount,
        paymentStatus,
        transactionId,
        paymentMethod,
      });

      // Only process successful payments
      if (paymentStatus === "SUCCESS" && orderId) {
        await handleSuccessfulPayment({
          orderId,
          orderAmount,
          transactionId,
          paymentMethod,
        });
      }
    }

    // Always respond with 200 to acknowledge webhook receipt
    res.status(200).json({
      received: true,
      status: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(200).json({
      received: true,
      status: "Webhook received (processing error)",
      error: error.message,
    });
  }
};

// Handle successful payment
const handleSuccessfulPayment = async (paymentData) => {
  const { orderId, orderAmount, transactionId, paymentMethod } = paymentData;

  try {
    console.log("✅ Processing successful payment for order:", orderId);

    // 1. Get the payment order details
    const { data: paymentOrder, error: orderError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (orderError || !paymentOrder) {
      console.error("Payment order not found:", orderId);
      throw new Error("Payment order not found");
    }

    // 2. Check if we already processed this payment
    if (paymentOrder.payment_status === "success") {
      console.log("🔄 Payment already processed, skipping duplicate");
      return;
    }

    // 3. Create donation record
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert([
        {
          campaign_id: paymentOrder.campaign_id,
          donor_user_id: paymentOrder.user_id,
          donor_name: "", // Will be populated from users table in query
          donor_email: "", // Will be populated from users table in query
          amount: parseFloat(orderAmount),
          currency: "INR",
          payment_provider: "cashfree",
          provider_payment_id: transactionId,
          status: "completed",
        },
      ])
      .select()
      .single();

    if (donationError) {
      console.error("Error creating donation record:", donationError);
      throw donationError;
    }

    // 4. Update payment_orders with donation_id and success status
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
      console.error("Error updating payment order:", updateError);
      throw updateError;
    }

    // 5. Update campaign current_amount
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("current_amount")
      .eq("id", paymentOrder.campaign_id)
      .single();

    if (!campaignError) {
      const newAmount =
        (parseFloat(campaign.current_amount) || 0) + parseFloat(orderAmount);

      await supabase
        .from("campaigns")
        .update({
          current_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentOrder.campaign_id);

      console.log(
        `💰 Updated campaign ${paymentOrder.campaign_id} amount to: ${newAmount}`
      );
    }

    console.log("🎉 Payment processed successfully! Donation ID:", donation.id);
  } catch (error) {
    console.error("Error handling successful payment:", error);
    throw error;
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // First check our database
    const { data: paymentOrder, error: dbError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (dbError || !paymentOrder) {
      return res.status(404).json({ 
        error: 'Payment order not found' 
      });
    }

    // If payment is already successful in our database, return it
    if (paymentOrder.payment_status === 'success') {
      return res.json({
        order: {
          order_id: paymentOrder.order_id,
          order_amount: paymentOrder.amount
        },
        latestPayment: {
          payment_status: 'SUCCESS',
          cf_payment_id: paymentOrder.transaction_id
        }
      });
    }

    // Otherwise, check with CashFree
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
          order_amount: paymentOrder.amount
        },
        payments: payments,
        latestPayment: latestPayment
      });

    } catch (cashfreeError) {
      // If CashFree API fails, return our database status
      console.error('CashFree API error:', cashfreeError.response?.data);
      res.json({
        order: {
          order_id: orderId,
          order_amount: paymentOrder.amount
        },
        latestPayment: {
          payment_status: paymentOrder.payment_status.toUpperCase() || 'PENDING'
        }
      });
    }

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      error: 'Failed to get payment status',
      details: error.message
    });
  }
};
