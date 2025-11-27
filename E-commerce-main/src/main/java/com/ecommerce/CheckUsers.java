package com.ecommerce;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CheckUsers {
    public static void main(String[] args) {
        System.out.println("Checking users in database...");
        try (Connection conn = DatabaseConnection.getConnection()) {
            String sql = "SELECT * FROM users";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                    ResultSet rs = stmt.executeQuery()) {

                System.out.println("--------------------------------------------------");
                System.out.printf("%-5s | %-20s | %-30s\n", "ID", "Username", "Email");
                System.out.println("--------------------------------------------------");

                boolean found = false;
                while (rs.next()) {
                    found = true;
                    int id = rs.getInt("id");
                    String username = rs.getString("username");
                    String email = rs.getString("email");
                    System.out.printf("%-5d | %-20s | %-30s\n", id, username, email);
                }

                if (!found) {
                    System.out.println("No users found.");
                }
                System.out.println("--------------------------------------------------");
            }
        } catch (SQLException e) {
            System.err.println("Error connecting to database or querying users:");
            e.printStackTrace();
            System.err.println("\nPossible causes:");
            System.err.println("1. MySQL is not running.");
            System.err.println("2. Database 'ecommerce_db' does not exist.");
            System.err.println("3. Username/Password in DatabaseConnection.java are incorrect.");
        }
    }
}
