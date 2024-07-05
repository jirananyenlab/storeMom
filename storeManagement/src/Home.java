import com.toedter.calendar.JDateChooser;
import org.jdatepicker.impl.JDatePanelImpl;
import org.jdatepicker.impl.JDatePickerImpl;
import org.jdatepicker.impl.UtilDateModel;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
//implements ActionListener
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
    private JLabel Date;
    private JTextField orderQ;
    private JButton oUpdate;
    private JTextField cusFullnameField;
    private JTextField pVolume;
    private JTextField profitField;
    private JTextField totalAmout;
    private JTextField sPrice;
    private JComboBox proNameBox;
    private JComboBox cusNameBox;
    private JButton oAdd;
    private JButton oDelete;
    private JComboBox oDetailId;

    private Integer k = 0, id, productId, orderDetailId, quantityInStock, price, quantityOrdered, priceEach, totalAmount, profit;
    private String firstname, lastname, productName, volume;
    private String datePattern = "yyyy-MM-dd";

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
                        price = results.getInt(6);
                        totalAmount = results.getInt(7);
                        profit = results.getInt(8);
                        quantityOrdered = results.getInt(9);
                        priceEach = results.getInt(10);


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
                        price = results.getInt(4);
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


                try {
                    if (lname.getText().isBlank()) {
                        statement = connection.createStatement();
                        String sql = "insert into orders (orderId,totalAmount,customer_id,profit) value(?,?,?,?) ;";
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
        cusNameBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = (String) cusNameBox.getSelectedItem();
                System.out.println(name);
                try {
                    statement = connection.createStatement();
                    String sqlCustomer = "SELECT id FROM customer WHERE CONCAT(fname, ' ', lname) =?";
                    preparedStatement = connection.prepareStatement(sqlCustomer);
                    preparedStatement.setString(1, name);

                    ResultSet resultCustomerName = preparedStatement.executeQuery();
                    //   System.out.println(resultCustomerName);
                    while (resultCustomerName.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field
                        id = resultCustomerName.getInt(1);
                    }

                } catch (Exception ex) {
                    System.out.println(ex.getMessage() + "!!!!!");
                }
                System.out.println(id + "!!!");
            }
        });

        proNameBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = (String) proNameBox.getSelectedItem();
                System.out.println(name);
                try {
                    statement = connection.createStatement();
                    String sqlCustomer = "SELECT productId FROM product WHERE productName =?";
                    preparedStatement = connection.prepareStatement(sqlCustomer);
                    preparedStatement.setString(1, name);


                    ResultSet resultProductName = preparedStatement.executeQuery();
                    //    System.out.println(resultProductName);
                    while (resultProductName.next()) {
                        //สร้างตัวแปลเพื่อมาเก็บ field
                        productId = resultProductName.getInt(1);
                    }

                } catch (Exception ex) {
                    System.out.println(ex.getMessage() + "!!!!!");
                }
                System.out.println(productId + "!!!");
            }
        });
    }

    public void LoadAllCustomerToComboBox() {
        try {
            statement = connection.createStatement();
            String sqlCustomer = "SELECT concat(fname,\" \",lname)  FROM customer";
            ResultSet resultCustomerName = statement.executeQuery(sqlCustomer);

            while (resultCustomerName.next()) {
                cusNameBox.addItem(resultCustomerName.getString(1).toString());
                System.out.println(resultCustomerName.getString(1).toString());
            }
        } catch (Exception ex) {
            System.out.println(ex.getMessage() + "!!!!!");
        }
        cusNameBox.setEditable(true);
    }

    public void LoadAllProductToComboBox() {
        try {
            statement = connection.createStatement();
            String sqlProduct = "SELECT productName FROM product";
            ResultSet resultProductName = statement.executeQuery(sqlProduct);

            while (resultProductName.next()) {
                proNameBox.addItem(resultProductName.getString(1).toString());
                System.out.println(resultProductName.getString(1).toString());
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
                price = results.getInt(6);
                totalAmount = results.getInt(7);
                profit = results.getInt(8);
                quantityOrdered = results.getInt(9);
                priceEach = results.getInt(10);

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
                price = results.getInt(4);
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

    JDateChooser dateChooser = new JDateChooser();

    //private JDatePickerImpl datePicker;

    public static void main(String[] args) {

        Home home = new Home();
        home.LoadAllCustomerToComboBox();
        home.LoadAllProductToComboBox();

        home.JOrderDate.add(home.dateChooser);

//        UtilDateModel model = new UtilDateModel();
//        model.setDate(1990, 8, 24);
//        model.setSelected(true);
//        Properties p = new Properties();
//        // Set any properties you need for the date panel
//        // For example: p.put("text.today", "Today");
//        p.put("text.today", "Today");
//        p.put("text.month", "Month");
//        p.put("text.year", "Year");
//
//
//        // Create the JDatePanelImpl with the model and properties
//        JDatePanelImpl datePanel = new JDatePanelImpl(model, p);
//        home.datePicker = new JDatePickerImpl(datePanel, new DateLabelFormatter());

//        home.JOrderDate.add(home.datePicker);

        home.setContentPane(home.JpanalMain);
        home.setTitle("Store Management");
        home.setSize(1000, 600);
        home.setVisible(true);
        home.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

//    @Override
//    public void actionPerformed(ActionEvent event) {
//        // for UtilDateModel, the value returned is of type java.util.Date
//        java.util.Date selectedDate = (java.util.Date) datePicker.getModel().getValue();
//
//        // for UtilCalendarModel, the value returned is of type java.util.Calendar
////		Calendar selectedValue = (Calendar) datePicker.getModel().getValue();
////		Date selectedDate = selectedValue.getTime();
//
//        // for SqlDateModel, the value returned is of type java.sql.Date
////		java.sql.Date selectedDate = (java.sql.Date) datePicker.getModel().getValue();
//
//        JOptionPane.showMessageDialog(this, "The selected date is " + selectedDate);
//    }
}
