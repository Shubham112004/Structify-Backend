const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Reference environment variable

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY); // Use the actual key, not the string

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
    const { products, grandTotal } = req.body; // Receive grandTotal from the frontend

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

        // Create a checkout session with grandTotal
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            // Total price should be based on grandTotal
            amount_total: grandTotal * 100, // Convert to cents
            success_url: `${process.env.FRONTEND_URL}`,
            cancel_url: `${process.env.FRONTEND_URL}`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
