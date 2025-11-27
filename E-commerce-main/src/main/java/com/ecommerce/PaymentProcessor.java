package com.ecommerce;

public interface PaymentProcessor {
    boolean processPayment(double amount);
}
