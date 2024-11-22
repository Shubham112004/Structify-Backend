const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Reference environment variable

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY); // Use the actual key, not the string

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
    const { products, grandTotal } = req.body; // Receive products and grandTotal from frontend

    try {
        // Map products to Stripe's line_items format
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100, // Convert price to cents
            },
            quantity: product.quantity,
        }));

        // Add a custom metadata field with the grand total (to track it in Stripe)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems, // Send line items for Stripe to calculate total
            success_url: `${process.env.FRONTEND_URL}/success?total=${grandTotal}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                grand_total: grandTotal.toString(), // Include the grand total in metadata
            },
        });

        // Send the session URL to the frontend for redirection
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
