package com.ecommerce;

public class CreditCardPayment implements PaymentProcessor {
    @Override
    public boolean processPayment(double amount) {
        // Simulate payment processing
        System.out.println("Processing credit card payment of $" + amount);
        return true; // Assume success
    }
}
