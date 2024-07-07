import java.util.Objects;

public class OrderDetail {
    private int orderDetailId;
    private int orderId;
    private int productId;
    private int quantityOrdered;
    private double priceEach;

    public OrderDetail(int orderDetailId, int orderId, int productId, int quantityOrdered, double priceEach) {
        this.orderDetailId = orderDetailId;
        this.orderId = orderId;
        this.productId = productId;
        this.quantityOrdered = quantityOrdered;
        this.priceEach = priceEach;
    }

    public OrderDetail(int productId, int quantityOrdered, double priceEach) {
        this.productId = productId;
        this.quantityOrdered = quantityOrdered;
        this.priceEach = priceEach;
    }

    public int getOrderDetailId() {
        return orderDetailId;
    }

    public void setOrderDetailId(int orderDetailId) {
        this.orderDetailId = orderDetailId;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getQuantityOrdered() {
        return quantityOrdered;
    }

    public void setQuantityOrdered(int quantityOrdered) {
        this.quantityOrdered = quantityOrdered;
    }

    public double getPriceEach() {
        return priceEach;
    }

    public void setPriceEach(double priceEach) {
        this.priceEach = priceEach;
    }

    @Override
    public String toString() {
        return "OrderDetail{" +
                "orderDetailId=" + orderDetailId +
                ", orderId=" + orderId +
                ", productId=" + productId +
                ", quantityOrdered=" + quantityOrdered +
                ", priceEach=" + priceEach +
                '}';
    }
}
