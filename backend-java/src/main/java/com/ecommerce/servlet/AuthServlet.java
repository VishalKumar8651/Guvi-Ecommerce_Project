package com.ecommerce.servlet;

import com.ecommerce.dao.UserDAO;
import com.ecommerce.model.User;
import com.google.gson.Gson;
import org.mindrot.jbcrypt.BCrypt;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        resp.setContentType("application/json");

        String body = req.getReader().lines().collect(Collectors.joining());
        User user = gson.fromJson(body, User.class);
        Map<String, Object> response = new HashMap<>();

        if ("/register".equals(path)) {
            if (userDAO.findByEmail(user.getEmail()) != null) {
                response.put("success", false);
                response.put("message", "Email already exists");
            } else {
                user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
                if (userDAO.create(user)) {
                    response.put("success", true);
                    response.put("token", "dummy-jwt-token-for-" + user.getEmail()); // Simplified for assignment
                } else {
                    response.put("success", false);
                    response.put("message", "Registration failed");
                }
            }
        } else if ("/login".equals(path)) {
            User existingUser = userDAO.findByEmail(user.getEmail());
            if (existingUser != null && BCrypt.checkpw(user.getPassword(), existingUser.getPassword())) {
                response.put("success", true);
                response.put("token", "dummy-jwt-token-for-" + existingUser.getEmail());
            } else {
                response.put("success", false);
                response.put("message", "Invalid credentials");
            }
        }

        resp.getWriter().write(gson.toJson(response));
    }
}
