package com.ecommerce;

import com.ecommerce.dao.ProductDAO;
import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.service.OrderService;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        try {
            // Create DAOs
            ProductDAO productDAO = new ProductDAO();
            UserDAO userDAO = new UserDAO();
            OrderService orderService = new OrderService();

            // Create sample data
            Product product1 = new Product(0, "Laptop", 999.99, "Electronics", 10);
            Product product2 = new Product(0, "Book", 19.99, "Books", 50);

            User user = new User(0, "john_doe", "john@example.com", "password123");

            // CRUD operations
            productDAO.create(product1);
            productDAO.create(product2);
            userDAO.create(user);

            // Read all products
            List<Product> products = productDAO.readAll();
            System.out.println("Products: " + products);

            // Polymorphism example
            PaymentProcessor payment = new CreditCardPayment();
            // Simulate order placement with multithreading
            // Note: In real app, order would be created with user and products

            System.out.println("E-commerce backend initialized successfully.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
