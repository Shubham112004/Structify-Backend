const { Clerk } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk with your API key (found in your Clerk dashboard)
Clerk({ apiKey: process.env.CLERK_API_KEY });

// Or alternatively you can set Clerk API keys directly
// Clerk.setApiKey(process.env.CLERK_API_KEY);
