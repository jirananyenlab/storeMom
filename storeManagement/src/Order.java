import java.util.ArrayList;

public class Order {

    private int orderId;
    private Double totalAmount = 0.0;
    private int customerId;
    private String orderDate;
    private Double profit = 0.0;
    private ArrayList<OrderDetail> orderDetails = new ArrayList<OrderDetail>();

    public Order(int orderId, Double totalAmount, int customerId, String orderDate, Double profit) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.profit = profit;
    }

    public Order(Double totalAmount, int customerId, String orderDate) {
        this.totalAmount = totalAmount;
        this.customerId = customerId;
        this.orderDate = orderDate;
    }
    public Order(int customerId,String orderDate) {
        this.customerId = customerId;
        this.orderDate = orderDate;
    }
    public Order() {
    }

    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
    }

    public void addTotalAmount(Double totalAmount){
        this.totalAmount += totalAmount;
    }

    public void addProfit(Double profit){
        this.profit += profit;
    }

    public void clearOrder(){
        totalAmount = 0.0;
        profit = 0.0;
        orderDetails.clear();
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public Double getProfit() {
        return profit;
    }

    public void setProfit(Double profit) {
        this.profit = profit;
    }

    public ArrayList<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(ArrayList<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    @Override
    public String toString() {
        return "Order{" +
                "orderDetails=" + orderDetails +
                '}';
    }
}
