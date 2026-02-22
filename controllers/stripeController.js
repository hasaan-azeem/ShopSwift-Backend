// server/controllers/stripeController.js
import Stripe from "stripe";

// POST /api/stripe/create-payment-intent
export const createPaymentIntent = async (req, res) => {
  const { amount, currency = "pkr" } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "A valid amount is required." });
  }

  try {
    // Initialize inside the function so dotenv.config() has already run
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error.message);
    res.status(500).json({ error: error.message });
  }
};