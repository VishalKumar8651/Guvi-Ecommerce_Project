package com.ecommerce.model;

public class ElectronicProduct extends Product {
    private String brand;
    private String warranty;

    public ElectronicProduct() {}

    public ElectronicProduct(int id, String name, double price, String category, int stock, String brand, String warranty) {
        super(id, name, price, category, stock);
        this.brand = brand;
        this.warranty = warranty;
    }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    @Override
    public String toString() {
        return "ElectronicProduct{" +
                "id=" + getId() +
                ", name='" + getName() + '\'' +
                ", price=" + getPrice() +
                ", category='" + getCategory() + '\'' +
                ", stock=" + getStock() +
                ", brand='" + brand + '\'' +
                ", warranty='" + warranty + '\'' +
                '}';
    }
}
