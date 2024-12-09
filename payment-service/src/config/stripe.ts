import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-10-28.acacia',
});

export async function createStripeCustomer(studentId: string) {
    try {
      // Check if the customer already exists, if not, create a new customer
      const customer = await stripe.customers.create({
        metadata: { studentId }, // Store the student ID in metadata for reference
      });
      return customer.id; // Return the customer ID to use for future payments
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error; // Handle the error appropriately
    }
  }
