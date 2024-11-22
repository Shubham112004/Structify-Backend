const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY; // Reference environment variable

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY); // Use the actual key, not the string

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
    const { products, grandTotal, tax, shipping } = req.body; // Receive products, grandTotal, tax, shipping from frontend

    try {
        // Map products to Stripe's line_items format
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100, // Convert price to cents (Stripe works in cents)
            },
            quantity: product.quantity,
        }));

        // If tax and shipping need to be included in the checkout, add them as line items as well
        if (tax && tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Tax',
                    },
                    unit_amount: tax * 100, // Convert tax to cents
                },
                quantity: 1,
            });
        }

        if (shipping && shipping > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping',
                    },
                    unit_amount: shipping * 100, // Convert shipping to cents
                },
                quantity: 1,
            });
        }

        // Now, the total price (including products, tax, and shipping) will be automatically calculated by Stripe
        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems, // Send line items for Stripe to calculate the total price
            success_url: `${process.env.FRONTEND_URL}/success?total=${grandTotal}`, // Pass grandTotal to success URL
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                grand_total: grandTotal.toString(), // Include the grand total in metadata for tracking
            },
        });

        // Send the session URL to the frontend for redirection
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
