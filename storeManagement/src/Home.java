import com.github.lgooddatepicker.components.DatePicker;
import com.github.lgooddatepicker.components.DatePickerSettings;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Home extends JFrame {
    private JTabbedPane tabbedPane1;
    private JLabel Jfirstname;
    private JPanel JpanalMain;
    private JPanel page1;
    private JPanel page3;
    private JPanel page6;
    private JPanel JOrderDate;
    private JLabel Jlastname;
    private JTextField fname;
    private JTextField lname;
    private JButton cAdd;
    private JTable cusDb;
    private JButton cSearch;
    private JButton cUpdate;
    private JButton cDelete;
    private JButton cNew;
    private JTextField pPrice;
    private JLabel cusFullname;
    private JButton pAdd;
    private JButton pUpdate;
    private JButton pDelete;
    private JButton pNew;
    private JTable proDb;
    private JButton pSearch;
    private JTextField pName;
    private JTextField pStock;
    private JLabel customerName;
    private JLabel Dated;
    private JTextField orderQ;
    private JButton oUpdate;
    private JTextField cusFullnameField;
    private JTextField pVolume;
    private JTextField odTotalAmount;
    private JTextField odTotalProfit;
    private JTextField sPrice;
    private JComboBox proNameBox;
    private JComboBox cusNameBox;
    private JButton oAdd;
    private JButton oDelete;
    private JTextField productIn;
    private JButton oNew;
    private JTable orderTable;
    private JTextField odQuantity;
    private JTextField odPriceEach;
    private JButton odSearch;
    private JTextField oderIdSearch;
    private JTable orderTableAdd;
    private JButton odClear;
    private JButton odConfirm;
    private JComboBox cusNameBox2;
    private JButton oAll;

    private Integer k = 0, id, productId, orderId, customerId, orderDetailId, quantityInStock, quantityOrdered;
    private String firstname, lastname, productName, volume;
    private Double profit, totalAmount, price, priceEach;
    private Order orderAll = new Order();
    private LocalDate selectedDate;
    private Time selectedTime;

    PreparedStatement preparedStatement;
    Connection connection = storeConnection.connect();
    Statement statement;


    public Home() {

        cAdd.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    if (!fname.getText().isBlank() && !lname.getText().isBlank()) {
                        statement = connection.createStatement();
                        String sql = "INSERT INTO customer (fname,lname) VALUES(?,?)";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setString(1, fname.getText());
                        preparedStatement.setString(2, lname.getText());

                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }
                    if (k == 1) {
                        JOptionPane.showMessageDialog(cAdd, "Customer Added Successfully");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                        fname.setText("");
                        lname.setText("");
                    } else {
                        JOptionPane.showMessageDialog(cAdd, "An error occur to add customer");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });
        cUpdate.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    statement = connection.createStatement();
//                    String sqlSelect = "SELECT id , fname as firstname , lname as lastname  FROM customer where  concat(fname,\" \",lname)  like \"%"+cusFullnameField.getText()+ "%\"";
//
//                    preparedStatement = connection.prepareStatement(sqlSelect);
//
//                    ResultSet resultSet = preparedStatement.executeQuery();
//                     String id = "";
//                    while (resultSet.next()){
//                      id = resultSet.getString(1);
//                        System.out.println(id);
//                    }
                    if (!fname.getText().isBlank() && !lname.getText().isBlank()) {
                        String sql = "UPDATE customer SET  fname=? , lname=? where  id= ?";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setString(1, fname.getText());
                        preparedStatement.setString(2, lname.getText());
                        preparedStatement.setInt(3, id);

                        System.out.println("SQL Query: " + sql);
                        System.out.println("fname: " + fname.getText());
                        System.out.println("lname: " + lname.getText());
                        System.out.println("id: " + id);

                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }
                    if (k == 1) {
                        JOptionPane.showMessageDialog(cUpdate, "Customer Update Successfully");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                        fname.setText("");
                        lname.setText("");
                    } else {
                        JOptionPane.showMessageDialog(cUpdate, "An error occur to update customer");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });

        cSearch.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!cusFullnameField.getText().isBlank()) {
                    LoadAllCustomersByName();
                }
                // cusFullnameField.setText("");
            }
        });
        cDelete.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    statement = connection.createStatement();
//
//                    String sqlSelect = "SELECT id , fname as firstname , lname as lastname  FROM customer where  concat(fname,\" \",lname)  like \"%"+cusFullnameField.getText()+ "%\"";
//
//                    preparedStatement = connection.prepareStatement(sqlSelect);
//
//                    ResultSet resultSet = preparedStatement.executeQuery();
//                    String id = "";
//                    while (resultSet.next()){
//                        id = resultSet.getString(1);
//                    }
                    System.out.println(id);
                    if (!fname.getText().isBlank() && !lname.getText().isBlank()) {
                        String sql = "DELETE FROM customer WHERE id=?";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setInt(1, id);

                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }

                    if (k == 1) {
                        JOptionPane.showMessageDialog(cAdd, "Customer Delete Successfully");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                        fname.setText("");
                        lname.setText("");
                    } else {
                        JOptionPane.showMessageDialog(cAdd, "An error occur to delete customer");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });
        cNew.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                DefaultTableModel model = (DefaultTableModel) cusDb.getModel();
                //clear row in table
                model.setRowCount(0);
//        JOptionPane.showMessageDialog(cAdd, cusFullname.getIn+!!);
                PreparedStatement preparedStatement;
                Connection connection = storeConnection.connect();
                Statement statement;
                try {
                    statement = connection.createStatement();
                    String sql = "SELECT id , fname as firstname , lname as lastname  ,od.orderDetailId,p.productName,p.price,o.totalAmount,o.profit ,od.quantityOrdered,od.priceEach \n" +
                            "FROM product p  join  orderdetail od on p.productId = od.productId\n" +
                            "right join orders o on od.orderId = o.orderId\n" +
                            "right join customer c on c.id = o.customer_id ";
                    ResultSet results = statement.executeQuery(sql);
                    ResultSetMetaData rsmd = results.getMetaData();
                    int cols = rsmd.getColumnCount();
                    String[] columnNames = new String[cols];
                    for (int i = 0; i < cols; i++) {
                        columnNames[i] = rsmd.getColumnName(i + 1);
                        if (columnNames[i].equalsIgnoreCase("fname")) {
                            columnNames[i] = "firstname";
                        } else if (columnNames[i].equalsIgnoreCase("lname")) {
                            columnNames[i] = "lastname";
                        }
                    }
                    //ชื่อ column
                    model.setColumnIdentifiers(columnNames);


                    while (results.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field

                        id = results.getInt(1);
                        firstname = results.getString(2);
                        lastname = results.getString(3);
                        orderDetailId = results.getInt(4);
                        productName = results.getString(5);
                        price = results.getDouble(6);
                        totalAmount = results.getDouble(7);
                        profit = results.getDouble(8);
                        quantityOrdered = results.getInt(9);
                        priceEach = results.getDouble(10);


                        String[] row = {String.valueOf(id), firstname, lastname, String.valueOf(orderDetailId), productName, String.valueOf(price), String.valueOf(totalAmount), String.valueOf(profit), String.valueOf(quantityOrdered), String.valueOf(priceEach)};
                        model.addRow(row);
                    }
                    //           System.out.println( model.getRowCount());
                    if (model.getRowCount() == 1) {
                        fname.setText(firstname);
                        lname.setText(lastname);
                    }
                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        });

        pSearch.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!pName.getText().isBlank()) {
                    LoadAllProductByName();
                }
            }
        });

        pAdd.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    if (!pName.getText().isBlank() && !pStock.getText().isBlank() && !pPrice.getText().isBlank()) {
                        statement = connection.createStatement();
                        String sql = "INSERT INTO product (productName,quantityInStock,price,volume) VALUES(?,?,?,?)";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setString(1, pName.getText());
                        preparedStatement.setInt(2, Integer.parseInt(pStock.getText()));
                        preparedStatement.setInt(3, Integer.parseInt(pPrice.getText()));
                        preparedStatement.setString(4, pVolume.getText());

                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }
                    if (k == 1) {
                        JOptionPane.showMessageDialog(cAdd, "Product Added Successfully");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                        pName.setText("");
                        pStock.setText("");
                        pPrice.setText("");
                        pVolume.setText("");
                    } else {
                        JOptionPane.showMessageDialog(cAdd, "An error occur to add Product");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });
        pUpdate.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    if (!pName.getText().isBlank() && !pStock.getText().isBlank() && !pPrice.getText().isBlank()) {
                        statement = connection.createStatement();
//                        String sqlSelect = "SELECT productId   FROM product where  productName  like \"%"+pName.getText()+ "%\"";
//                        preparedStatement = connection.prepareStatement(sqlSelect);
//                        ResultSet resultSet = preparedStatement.executeQuery();
//                        String id = "";
//                        while (resultSet.next()){
//                            id = resultSet.getString(1);
//                            System.out.println(id);
//                        }
                        String sql = "UPDATE product SET  productName=? , quantityInStock=? ,price=? , volume=?  where  productId= ?";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setString(1, pName.getText());
                        preparedStatement.setInt(2, Integer.parseInt(pStock.getText()));
                        preparedStatement.setInt(3, Integer.parseInt(pPrice.getText()));
                        preparedStatement.setString(4, pVolume.getText());
                        preparedStatement.setInt(5, productId);


                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }

                    if (k == 1) {
                        JOptionPane.showMessageDialog(cUpdate, "Product Update Successfully");
                        pName.setText("");
                        pStock.setText("");
                        pPrice.setText("");
                        pVolume.setText("");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                    } else {
                        JOptionPane.showMessageDialog(cUpdate, "An error occur to update Product");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }

        });

        pDelete.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    if (!pName.getText().isBlank() && !pStock.getText().isBlank() && !pPrice.getText().isBlank()) {
                        System.out.println(id);
                        statement = connection.createStatement();
                        String sql = "DELETE FROM product WHERE productId=?";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setInt(1, productId);

                        k = preparedStatement.executeUpdate();
                    } else {
                        k = 0;
                    }
                    if (k == 1) {
                        JOptionPane.showMessageDialog(cAdd, "Product Delete Successfully");
                        pName.setText("");
                        pStock.setText("");
                        pPrice.setText("");
                        pVolume.setText("");
                        preparedStatement = connection.prepareStatement("commit ");
                        preparedStatement.executeUpdate();
                    } else {
                        JOptionPane.showMessageDialog(cAdd, "An error occur to delete Product");
                        preparedStatement = connection.prepareStatement("rollback ");
                        preparedStatement.executeUpdate();
                    }

                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });
        pNew.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                DefaultTableModel model = (DefaultTableModel) proDb.getModel();
                //clear row in table
                model.setRowCount(0);
                PreparedStatement preparedStatement;
                Connection connection = storeConnection.connect();
                Statement statement;
                try {
                    statement = connection.createStatement();
                    String sql = "SELECT productId , productName  , quantityInStock  ,price,volume FROM product";
                    ResultSet results = statement.executeQuery(sql);
                    ResultSetMetaData rsmd = results.getMetaData();
                    int cols = rsmd.getColumnCount();
                    String[] columnNames = new String[cols];
                    for (int i = 0; i < cols; i++) {
                        columnNames[i] = rsmd.getColumnName(i + 1);
                    }
                    //ชื่อ column
                    model.setColumnIdentifiers(columnNames);


                    while (results.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field
                        productId = results.getInt(1);
                        productName = results.getString(2);
                        quantityInStock = results.getInt(3);
                        price = results.getDouble(4);
                        volume = results.getString(5);
                        String[] row = {String.valueOf(productId), productName, String.valueOf(quantityInStock), String.valueOf(price), volume};
                        model.addRow(row);
                    }
                    //  System.out.println( model.getRowCount());
                    if (model.getRowCount() == 1) {
                        pName.setText(productName);
                        pStock.setText(String.valueOf(quantityInStock));
                        pPrice.setText(String.valueOf(price));
                        pVolume.setText(String.valueOf(volume));
                    }
                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        });

        oAdd.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (selectedDate == null || selectedTime == null) {
                    selectedDate = LocalDate.now();
                    selectedTime = Time.valueOf(LocalDateTime.now().toLocalTime());
                }
                LocalDateTime dateTimeAdd = LocalDateTime.of(selectedDate, selectedTime.toLocalTime());
                totalAmount = Double.parseDouble(orderQ.getText()) * Double.parseDouble(sPrice.getText());
                profit = totalAmount - (Double.parseDouble(orderQ.getText()) * price);

                orderAll.setCustomerId(customerId);
                orderAll.setOrderDate(String.valueOf(Timestamp.valueOf(dateTimeAdd)));
                orderAll.addOrderDetail(new OrderDetail(productId,Integer.parseInt(orderQ.getText()), Double.parseDouble(sPrice.getText())));
                orderAll.addTotalAmount(totalAmount);
                orderAll.addProfit(profit);

                DefaultTableModel model = (DefaultTableModel) orderTableAdd.getModel();
                String[] columnNames = new String[6];
                columnNames[0] = "Select Product";
                columnNames[1] = "Order quantity";
                columnNames[2] = "Selling price";
                columnNames[3] = "DateTime";
                columnNames[4] = "totalAmount";
                columnNames[5] = "profit";

                //ชื่อ column
                model.setColumnIdentifiers(columnNames);

                String[] row = {
                        String.valueOf(productId),
                        String.valueOf(orderQ.getText()),
                        String.valueOf(sPrice.getText()),
                        String.valueOf(Timestamp.valueOf(dateTimeAdd)),
                        String.valueOf(totalAmount),
                        String.valueOf(profit)
                };
                model.addRow(row);

                odTotalAmount.setText(String.valueOf(orderAll.getTotalAmount()));
                odTotalProfit.setText(String.valueOf(orderAll.getProfit()));
            }
        });
        oUpdate.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {

            }
        });
        oDelete.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {

            }
        });
        oAll.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                DefaultTableModel model = (DefaultTableModel) orderTable.getModel();
                //clear row in table
                model.setRowCount(0);
                Connection connection = storeConnection.connect();
                Statement statement;
                try {
                    statement = connection.createStatement();
                    String sqlOrder = "SELECT orderId , totalAmount  , customer_id ,profit,orderDate FROM orders";
                    ResultSet results = statement.executeQuery(sqlOrder);
                    ResultSetMetaData rsmd = results.getMetaData();
                    int cols = rsmd.getColumnCount();
                    String[] columnNames = new String[cols];
                    for (int i = 0; i < cols; i++) {
                        columnNames[i] = rsmd.getColumnName(i + 1);
                    }
                    //ชื่อ column
                    model.setColumnIdentifiers(columnNames);

                    while (results.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field
                        String[] row = {
                                String.valueOf(results.getInt(1)),
                                String.valueOf(results.getInt(2)),
                                String.valueOf(results.getInt(3)),
                                results.getString(4),
                                results.getString(5)
                        };
                        model.addRow(row);
                    }
                    //  System.out.println( model.getRowCount());
//                    if (model.getRowCount() == 1) {
//                        pName.setText(productName);
//                        pStock.setText(String.valueOf(quantityInStock));
//                        pPrice.setText(String.valueOf(price));
//                        pVolume.setText(String.valueOf(volume));
//                    }
                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        });
        odConfirm.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    statement = connection.createStatement();
                    String sql = "insert into orders (totalAmount,customer_id,orderDate,profit) value(?,?,?,?)";
                    preparedStatement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    preparedStatement.setDouble(1, orderAll.getTotalAmount());
                    preparedStatement.setInt(2, orderAll.getCustomerId());
                    preparedStatement.setString(3, orderAll.getOrderDate());
                    preparedStatement.setDouble(4, orderAll.getProfit());

                    k = preparedStatement.executeUpdate();

                    ResultSet generatedKeys = preparedStatement.getGeneratedKeys();
                    if (generatedKeys.next()) {
                        orderId = generatedKeys.getInt(1); // รับค่า orderId ที่ถูกสร้างขึ้น
                        System.out.println(orderAll.getOrderDetails());
                        orderAll.getOrderDetails().forEach(orderDetail -> {
                            try {
                                String sqlOrderDetail = "insert into orderdetail (quantityOrdered,priceEach,productId,orderId) value(?,?,?,?)";
                                preparedStatement = connection.prepareStatement(sqlOrderDetail);
                                preparedStatement.setInt(1, orderDetail.getQuantityOrdered());
                                preparedStatement.setDouble(2, orderDetail.getPriceEach());
                                preparedStatement.setInt(3, orderDetail.getProductId());
                                preparedStatement.setInt(4, orderId);

                                preparedStatement.executeUpdate();
                            } catch (SQLException ex) {
                                Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                            }
                        });
                    }
                    System.out.println(k);
                    if (k == 1) {
                        JOptionPane.showMessageDialog(cAdd, "Customer Added Successfully");
                        preparedStatement = connection.prepareStatement("commit");
                        preparedStatement.executeUpdate();
                        fname.setText("");
                        lname.setText("");
                    } else {
                        JOptionPane.showMessageDialog(cAdd, "An error occur to add customer");
                        preparedStatement = connection.prepareStatement("rollback");
                        preparedStatement.executeUpdate();
                    }
                } catch (SQLException ex) {
                    Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                }
                k = 0;
            }
        });
        odClear.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                DefaultTableModel model = (DefaultTableModel) orderTableAdd.getModel();
                model.setRowCount(0);
                orderAll.clearOrder();
                odTotalAmount.setText("");
                odTotalProfit.setText("");
            }
        });

        odSearch.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!oderIdSearch.getText().isBlank()) {
                    try {
                        connection.createStatement();
                        String sql = "SELECT * FROM orderdetail where orderDetailId = ?";
                        preparedStatement = connection.prepareStatement(sql);
                        preparedStatement.setInt(1, Integer.parseInt(oderIdSearch.getText()));

                        ResultSet results = preparedStatement.executeQuery();

                        if (results.next()) {
                            orderDetailId = results.getInt(1);
                            quantityOrdered = results.getInt(2);
                            priceEach = results.getDouble(3);
                            productId = results.getInt(4);
                            orderId = results.getInt(5);
                        }
                        odQuantity.setText(String.valueOf(quantityOrdered));
                        odPriceEach.setText(String.valueOf(priceEach));

                    } catch (SQLException ex) {
                        Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
                    }
                } else {
                    JOptionPane.showMessageDialog(odSearch, "Please enter order id");
                }
            }
        });


        cusNameBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = (String) cusNameBox.getSelectedItem();
                getCustomerByName(name);
            }
        });
        cusNameBox2.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = (String) cusNameBox2.getSelectedItem();
                getCustomerByName(name);
            }
        });
        proNameBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = (String) proNameBox.getSelectedItem();
                System.out.println(name);
                try {
                    statement = connection.createStatement();
                    String sqlCustomer = "SELECT productId,quantityInStock,price FROM product WHERE productName =?";
                    preparedStatement = connection.prepareStatement(sqlCustomer);
                    preparedStatement.setString(1, name);


                    ResultSet resultProductName = preparedStatement.executeQuery();
                    //    System.out.println(resultProductName);
                    while (resultProductName.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field
                        productId = resultProductName.getInt(1);
                        productIn.setText(String.valueOf(resultProductName.getInt(2)));
                        price = resultProductName.getDouble(3);
                    }

                } catch (Exception ex) {
                    System.out.println(ex.getMessage() + "!!!!!");
                }
                System.out.println(productId + "!!!");
                System.out.println(price + "!!!");
            }
        });
        oAll.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                LoadAllCustomerToComboBox();
                LoadAllProductToComboBox();
            }
        });
    }

    public void getCustomerByName(String name) {
        try {
            statement = connection.createStatement();
            String sqlCustomer = "SELECT id FROM customer WHERE CONCAT(fname, ' ', lname) =?";
            preparedStatement = connection.prepareStatement(sqlCustomer);
            preparedStatement.setString(1, name);

            ResultSet resultCustomerName = preparedStatement.executeQuery();
            //   System.out.println(resultCustomerName);
            while (resultCustomerName.next()) {
                //สร้างตัวแปลเพื่อมาเก็บ field
                customerId = resultCustomerName.getInt(1);
            }

        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
        System.out.println(customerId + "!!!");
    }

    public void setNewQuantityInStock(int productId) {
        try {
            statement = connection.createStatement();
            String sql = "UPDATE product SET quantityInStock=? WHERE productId = ?";
            preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, Integer.parseInt(productIn.getText()));
            preparedStatement.setInt(1, productId);

            preparedStatement.executeUpdate();


        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
    }

    public int getNewQuantityInStock(int productId) {
        try {
            statement = connection.createStatement();
            String sql = "select quantityInStock from product where  productId = ?";
            preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, productId);

            ResultSet resultSet = preparedStatement.executeQuery();

            while (resultSet.next()) {
                quantityInStock = resultSet.getInt(1);
            }
        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
        return quantityInStock;
    }

    public void LoadAllCustomerToComboBox() {
        try {
            cusNameBox.removeAllItems();
            cusNameBox2.removeAllItems();
            statement = connection.createStatement();
            String sqlCustomer = "SELECT concat(fname,\" \",lname)  FROM customer";
            ResultSet resultCustomerName = statement.executeQuery(sqlCustomer);
            while (resultCustomerName.next()) {
                cusNameBox.addItem(resultCustomerName.getString(1).toString());
                cusNameBox2.addItem(resultCustomerName.getString(1).toString());
            }

        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
        cusNameBox.setEditable(true);
    }

    public void LoadAllProductToComboBox() {
        try {
            proNameBox.removeAllItems();
            statement = connection.createStatement();
            String sqlProduct = "SELECT productName FROM product";
            ResultSet resultProduct = statement.executeQuery(sqlProduct);

            while (resultProduct.next()) {
                proNameBox.addItem(resultProduct.getString(1).toString());
                System.out.println(resultProduct.getString(1).toString());
            }


        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
        proNameBox.setEditable(true);

    }

    public void LoadAllCustomersByName() {
        DefaultTableModel model = (DefaultTableModel) cusDb.getModel();
        //clear row in table
        model.setRowCount(0);
        PreparedStatement preparedStatement;
        Connection connection = storeConnection.connect();
        Statement statement;
        try {
            statement = connection.createStatement();
            String sql = "SELECT id , fname as firstname , lname as lastname, od.orderDetailId ,p.productName,p.price,o.totalAmount,o.profit ,od.quantityOrdered,od.priceEach  \n" +
                    "FROM product p  join  orderdetail od on p.productId = od.productId\n" +
                    "right join orders o on od.orderId = o.orderId\n" +
                    "right join customer c on c.id = o.customer_id where  concat(fname,\" \",lname)  like \"%" + cusFullnameField.getText() + "%\"";
            ResultSet results = statement.executeQuery(sql);
            ResultSetMetaData rsmd = results.getMetaData();
            int cols = rsmd.getColumnCount();
            String[] columnNames = new String[cols];
            for (int i = 0; i < cols; i++) {
                columnNames[i] = rsmd.getColumnName(i + 1);
                if (columnNames[i].equalsIgnoreCase("fname")) {
                    columnNames[i] = "firstname";
                } else if (columnNames[i].equalsIgnoreCase("lname")) {
                    columnNames[i] = "lastname";
                }
            }
            //ชื่อ column
            model.setColumnIdentifiers(columnNames);


            while (results.next()) {
                //สร้างตัวแปลเพื่อมาเก็บ field

                id = results.getInt(1);
                firstname = results.getString(2);
                lastname = results.getString(3);
                orderDetailId = results.getInt(4);
                productName = results.getString(5);
                price = results.getDouble(6);
                totalAmount = results.getDouble(7);
                profit = results.getDouble(8);
                quantityOrdered = results.getInt(9);
                priceEach = results.getDouble(10);

                String[] row = {String.valueOf(id), firstname, lastname, String.valueOf(orderDetailId), productName, String.valueOf(price), String.valueOf(totalAmount), String.valueOf(profit), String.valueOf(quantityOrdered), String.valueOf(priceEach)};
                model.addRow(row);
            }
            //  System.out.println( model.getRowCount());
            if (model.getRowCount() == 1) {
                fname.setText(firstname);
                lname.setText(lastname);
            }
        } catch (SQLException ex) {
            Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void LoadAllProductByName() {
        DefaultTableModel model = (DefaultTableModel) proDb.getModel();
        //clear row in table
        model.setRowCount(0);
        PreparedStatement preparedStatement;
        Connection connection = storeConnection.connect();
        Statement statement;
        try {
            statement = connection.createStatement();
            String sql = "SELECT productId , productName  , quantityInStock  ,price,volume \n" +
                    "FROM product \n" +
                    "where  productName like \"%" + pName.getText() + "%\"";
            ResultSet results = statement.executeQuery(sql);
            ResultSetMetaData rsmd = results.getMetaData();
            int cols = rsmd.getColumnCount();
            String[] columnNames = new String[cols];
            for (int i = 0; i < cols; i++) {
                columnNames[i] = rsmd.getColumnName(i + 1);
            }
            //ชื่อ column
            model.setColumnIdentifiers(columnNames);


            while (results.next()) {
                //สร้างตัวแปลเพื่อมาเก็บ field
                productId = results.getInt(1);
                productName = results.getString(2);
                quantityInStock = results.getInt(3);
                price = results.getDouble(4);
                volume = results.getString(5);
                String[] row = {String.valueOf(productId), productName, String.valueOf(quantityInStock), String.valueOf(price), volume};
                model.addRow(row);
            }
            System.out.println(model.getRowCount());
            if (model.getRowCount() == 1) {
                pName.setText(productName);
                pStock.setText(String.valueOf(quantityInStock));
                pPrice.setText(String.valueOf(price));
                pVolume.setText(String.valueOf(volume));
            }
        } catch (SQLException ex) {
            Logger.getLogger(Home.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private Locale thaiLocale = new Locale("th", "TH");
    private Font thaiFont = new Font("Angsana New", Font.PLAIN, 24);

    public static void main(String[] args) {

        Home home = new Home();
        home.setContentPane(home.JpanalMain);
        home.LoadAllCustomerToComboBox();
        home.LoadAllProductToComboBox();
        // Set the default font for the application
        setDefaultFont(home.thaiFont);

        DatePickerSettings dateSettings = new DatePickerSettings(home.thaiLocale);
//        dateSettings.setFontCalendarDateLabels(home.thaiFont);
//        dateSettings.setFontCalendarWeekdayLabels(home.thaiFont);
//        dateSettings.setFontCalendarWeekNumberLabels(home.thaiFont);
//        dateSettings.setFontClearLabel(home.thaiFont);
//        dateSettings.setFontTodayLabel(home.thaiFont);
//        dateSettings.setFontMonthAndYearMenuLabels(home.thaiFont);
//        dateSettings.setFontMonthAndYearNavigationButtons(home.thaiFont);
//        dateSettings.setFontVetoedDate(home.thaiFont);
//        dateSettings.setFontValidDate(home.thaiFont);
//        dateSettings.setFontInvalidDate(home.thaiFont);
        DatePicker datePicker = new DatePicker(dateSettings);
        datePicker.setDateToToday();
        home.JOrderDate.add(datePicker);


        home.setTitle("Store Management");
        home.setSize(1000, 600);
        home.setVisible(true);
        home.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        datePicker.addDateChangeListener(event -> {
            home.selectedDate = event.getNewDate();
            home.selectedTime = Time.valueOf(LocalDateTime.now().toLocalTime());

            LocalDateTime dateTime = LocalDateTime.of(home.selectedDate, home.selectedTime.toLocalTime());
            System.out.println("Selected date: " + Timestamp.valueOf(dateTime));
        });
    }

    private static void setDefaultFont(Font font) {
        for (Object key : UIManager.getDefaults().keySet()) {
            if (key.toString().endsWith(".font")) {
                UIManager.put(key, font);
            }
        }
    }


}
