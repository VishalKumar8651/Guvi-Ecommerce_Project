package com.ecommerce.model;

import java.util.List;

public class Order {
    private int id;
    private int userId;
    private List<Product> products;
    private double totalAmount;
    private String status;

    public Order() {}

    public Order(int id, int userId, List<Product> products, double totalAmount, String status) {
        this.id = id;
        this.userId = userId;
        this.products = products;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", userId=" + userId +
                ", products=" + products +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                '}';
    }
}
