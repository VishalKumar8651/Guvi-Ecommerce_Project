package com.ecommerce.servlet;

import com.ecommerce.dao.CartDAO;
import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.CartItem;
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

@WebServlet("/api/cart/*")
public class CartServlet extends HttpServlet {
    private CartDAO cartDAO = new CartDAO();
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    private int getUserIdFromToken(HttpServletRequest req) {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // In a real app, verify JWT. Here we extract email from dummy token
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

        List<CartItem> items = cartDAO.findByUserId(userId);
        double total = items.stream().mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity()).sum();

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("totalPrice", total);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("cart", data);

        resp.getWriter().write(gson.toJson(response));
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleUpdate(req, resp);
    }

    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleUpdate(req, resp);
    }

    private void handleUpdate(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        int userId = getUserIdFromToken(req);
        if (userId == -1) {
            resp.setStatus(401);
            return;
        }

        String path = req.getPathInfo();
        String body = req.getReader().lines().collect(Collectors.joining());
        JsonObject json = gson.fromJson(body, JsonObject.class);

        if ("/add".equals(path)) {
            int productId = json.get("productId").getAsInt();
            int quantity = json.get("quantity").getAsInt();
            cartDAO.addToCart(userId, productId, quantity);
        } else if (path != null && path.startsWith("/update/")) {
            int productId = Integer.parseInt(path.substring(8));
            int quantity = json.get("quantity").getAsInt();
            cartDAO.updateQuantity(userId, productId, quantity);
        }

        resp.getWriter().write(gson.toJson(Map.of("success", true)));
    }

    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        int userId = getUserIdFromToken(req);
        if (userId == -1) {
            resp.setStatus(401);
            return;
        }

        String path = req.getPathInfo();
        if (path != null && path.startsWith("/remove/")) {
            int productId = Integer.parseInt(path.substring(8));
            cartDAO.removeItem(userId, productId);
        } else if ("/clear".equals(path)) {
            cartDAO.clearCart(userId);
        }

        resp.getWriter().write(gson.toJson(Map.of("success", true)));
    }
}
