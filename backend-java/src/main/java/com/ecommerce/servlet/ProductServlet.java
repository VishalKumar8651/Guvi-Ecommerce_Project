package com.ecommerce.servlet;

import com.ecommerce.dao.ProductDAO;
import com.ecommerce.model.Product;
import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/products/*")
public class ProductServlet extends HttpServlet {
    private ProductDAO productDAO = new ProductDAO();
    private Gson gson = new Gson();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        String search = req.getParameter("search");

        List<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productDAO.search(search);
        } else {
            products = productDAO.findAll();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("products", products);

        resp.getWriter().write(gson.toJson(response));
    }
}
