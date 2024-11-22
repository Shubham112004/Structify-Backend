const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Reference environment variable

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY); // Use the actual key, not the string

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
    const { products } = req.body;

    try {
        // Map products to Stripe's line_items format
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100, // Convert to cents
            },
            quantity: product.quantity,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${process.env.FRONTEND_URL}/success`, // Frontend URL for success
            cancel_url: `${process.env.FRONTEND_URL}/cancel`, // Frontend URL for cancel
        });

        res.json({ url: session.url }); // Send the session URL to the frontend
    } catch (error) {
        console.error("Error during checkout session creation:", error);
        res.status(500).json({ error: error.message }); // Return error message to frontend
    }
});

module.exports = router;
