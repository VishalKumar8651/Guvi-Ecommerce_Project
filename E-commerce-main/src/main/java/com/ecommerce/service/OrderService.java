package com.ecommerce.service;

import com.ecommerce.PaymentProcessor;
import com.ecommerce.dao.OrderDAO;
import com.ecommerce.dao.ProductDAO;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class OrderService {
    private OrderDAO orderDAO = new OrderDAO();
    private ProductDAO productDAO = new ProductDAO();
    private List<Order> orderQueue = new CopyOnWriteArrayList<>();
    private Map<String, Order> orderMap = new ConcurrentHashMap<>();
    private Set<String> processedOrders = ConcurrentHashMap.newKeySet();

    public synchronized void placeOrder(Order order, PaymentProcessor paymentProcessor) throws SQLException {
        // Polymorphism: paymentProcessor.processPayment can be any implementation
        if (paymentProcessor.processPayment(order.getTotalAmount())) {
            orderDAO.create(order);
            // Update stock in a separate thread
            new Thread(() -> {
                try {
                    updateStock(order.getProducts());
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }).start();
        } else {
            throw new RuntimeException("Payment failed");
        }
    }

    private synchronized void updateStock(List<Product> products) throws SQLException {
        for (Product product : products) {
            Product dbProduct = productDAO.read(product.getId());
            if (dbProduct != null && dbProduct.getStock() > 0) {
                dbProduct.setStock(dbProduct.getStock() - 1);
                productDAO.update(dbProduct);
            }
        }
    }

    public List<Order> getAllOrders() throws SQLException {
        return orderDAO.readAll();
    }

    public Order getOrder(int id) throws SQLException {
        return orderDAO.read(id);
    }
}
