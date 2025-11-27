package com.ecommerce.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class DatabaseConfig {
    private static final String URL = "jdbc:h2:mem:ecommerce;DB_CLOSE_DELAY=-1";
    private static final String USER = "sa";
    private static final String PASSWORD = "";

    static {
        try {
            Class.forName("org.h2.Driver");
            initDatabase();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    private static void initDatabase() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            
            // Execute schema.sql
            executeScript(stmt, "/schema.sql");
            
            // Check if products exist, if not execute data.sql
            if (!hasProducts(conn)) {
                executeScript(stmt, "/data.sql");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private static boolean hasProducts(Connection conn) {
        try (Statement stmt = conn.createStatement()) {
            return stmt.executeQuery("SELECT COUNT(*) FROM products").next();
        } catch (SQLException e) {
            return false;
        }
    }

    private static void executeScript(Statement stmt, String resourcePath) {
        try (InputStream is = DatabaseConfig.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                System.out.println("Script not found: " + resourcePath);
                return;
            }
            String sql = new BufferedReader(new InputStreamReader(is))
                .lines().collect(Collectors.joining("\n"));
            
            // Split by semicolon for multiple statements
            String[] statements = sql.split(";");
            for (String statement : statements) {
                if (!statement.trim().isEmpty()) {
                    stmt.execute(statement);
                }
            }
            System.out.println("Executed script: " + resourcePath);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
