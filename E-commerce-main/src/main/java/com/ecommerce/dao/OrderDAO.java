package com.ecommerce.dao;

import com.ecommerce.DatabaseConnection;
import com.ecommerce.model.Order;
import com.ecommerce.model.Product;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class OrderDAO {
    public void create(Order order) throws SQLException {
        String sql = "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, order.getUserId());
            stmt.setDouble(2, order.getTotalAmount());
            stmt.setString(3, order.getStatus());
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                order.setId(rs.getInt(1));
            }
            // Insert order items
            insertOrderItems(conn, order);
        }
    }

    private void insertOrderItems(Connection conn, Order order) throws SQLException {
        String sql = "INSERT INTO order_items (order_id, product_id) VALUES (?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (Product product : order.getProducts()) {
                stmt.setInt(1, order.getId());
                stmt.setInt(2, product.getId());
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    public Order read(int id) throws SQLException {
        String sql = "SELECT * FROM orders WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Order order = new Order(rs.getInt("id"), rs.getInt("user_id"), null,
                        rs.getDouble("total_amount"), rs.getString("status"));
                order.setProducts(getOrderItems(conn, id));
                return order;
            }
        }
        return null;
    }

    private List<Product> getOrderItems(Connection conn, int orderId) throws SQLException {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT p.* FROM products p JOIN order_items oi ON p.id = oi.product_id WHERE oi.order_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                products.add(new Product(rs.getInt("id"), rs.getString("name"), rs.getDouble("price"),
                        rs.getString("category"), rs.getInt("stock")));
            }
        }
        return products;
    }

    public List<Order> readAll() throws SQLException {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT * FROM orders";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Order order = new Order(rs.getInt("id"), rs.getInt("user_id"), null,
                        rs.getDouble("total_amount"), rs.getString("status"));
                order.setProducts(getOrderItems(conn, order.getId()));
                orders.add(order);
            }
        }
        return orders;
    }

    public void update(Order order) throws SQLException {
        String sql = "UPDATE orders SET user_id = ?, total_amount = ?, status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, order.getUserId());
            stmt.setDouble(2, order.getTotalAmount());
            stmt.setString(3, order.getStatus());
            stmt.setInt(4, order.getId());
            stmt.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM orders WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }
}
