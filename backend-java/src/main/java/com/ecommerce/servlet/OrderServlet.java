package com.ecommerce.servlet;

import com.ecommerce.dao.CartDAO;
import com.ecommerce.dao.OrderDAO;
import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/orders/*")
public class OrderServlet extends HttpServlet {
    private OrderDAO orderDAO = new OrderDAO();
    private CartDAO cartDAO = new CartDAO();
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    private int getUserIdFromToken(HttpServletRequest req) {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (token.startsWith("dummy-jwt-token-for-")) {
                String email = token.replace("dummy-jwt-token-for-", "");
                User user = userDAO.findByEmail(email);
                return user != null ? user.getId() : -1;
            }
        }
        return -1;
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        int userId = getUserIdFromToken(req);

        if (userId == -1) {
            resp.setStatus(401);
            return;
        }

        List<Order> orders = orderDAO.findByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orders", orders);

        resp.getWriter().write(gson.toJson(response));
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        int userId = getUserIdFromToken(req);

        if (userId == -1) {
            resp.setStatus(401);
            return;
        }

        String path = req.getPathInfo();
        if ("/create".equals(path)) {
            String body = req.getReader().lines().collect(Collectors.joining());
            JsonObject json = gson.fromJson(body, JsonObject.class);

            // Get cart items
            List<CartItem> cartItems = cartDAO.findByUserId(userId);
            if (cartItems.isEmpty()) {
                resp.getWriter().write(gson.toJson(Map.of("success", false, "message", "Cart is empty")));
                return;
            }

            double totalAmount = cartItems.stream().mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity()).sum();

            // Extract shipping address safely
            String address = "Default Address";
            if (json.has("shippingAddress")) {
                address = json.get("shippingAddress").toString();
            }

            String paymentMethod = json.has("paymentMethod") ? json.get("paymentMethod").getAsString() : "COD";

            // Create Order
            int orderId = orderDAO.createOrder(userId, totalAmount, address, paymentMethod);

            if (orderId != -1) {
                // Create Order Items
                orderDAO.createOrderItems(orderId, cartItems);

                // Clear Cart
                cartDAO.clearCart(userId);

                resp.getWriter().write(gson.toJson(Map.of("success", true, "orderId", orderId)));
            } else {
                resp.getWriter().write(gson.toJson(Map.of("success", false, "message", "Failed to create order")));
            }
        }
    }
}
