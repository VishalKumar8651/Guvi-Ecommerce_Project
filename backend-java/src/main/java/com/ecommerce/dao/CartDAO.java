package com.ecommerce.dao;

import com.ecommerce.config.DatabaseConfig;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CartDAO {
    public List<CartItem> findByUserId(int userId) {
        List<CartItem> items = new ArrayList<>();
        String sql = "SELECT c.*, p.* FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                CartItem item = new CartItem();
                item.setId(rs.getInt("c.id"));
                item.setUserId(rs.getInt("c.user_id"));
                item.setProductId(rs.getInt("c.product_id"));
                item.setQuantity(rs.getInt("c.quantity"));

                Product p = new Product();
                p.setId(rs.getInt("p.id"));
                p.setName(rs.getString("p.name"));
                p.setPrice(rs.getDouble("p.price"));
                p.setImage(rs.getString("p.image"));
                item.setProduct(p);

                items.add(item);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    public void addToCart(int userId, int productId, int quantity) {
        // Check if exists first
        String checkSql = "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, userId);
            checkStmt.setInt(2, productId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                // Update
                int currentQty = rs.getInt("quantity");
                updateQuantity(userId, productId, currentQty + quantity);
            } else {
                // Insert
                String insertSql = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)";
                try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                    insertStmt.setInt(1, userId);
                    insertStmt.setInt(2, productId);
                    insertStmt.setInt(3, quantity);
                    insertStmt.executeUpdate();
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateQuantity(int userId, int productId, int quantity) {
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn
                        .prepareStatement("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?")) {
            stmt.setInt(1, quantity);
            stmt.setInt(2, userId);
            stmt.setInt(3, productId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void removeItem(int userId, int productId) {
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn
                        .prepareStatement("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?")) {
            stmt.setInt(1, userId);
            stmt.setInt(2, productId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void clearCart(int userId) {
        try (Connection conn = DatabaseConfig.getConnection();
                PreparedStatement stmt = conn.prepareStatement("DELETE FROM cart_items WHERE user_id = ?")) {
            stmt.setInt(1, userId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
