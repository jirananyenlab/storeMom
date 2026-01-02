import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class storeConnection {
    public static Connection connect(){
        String URL = "jdbc:mysql://localhost:3306/storemom";
        String username = "root";
        String password = "";
        Connection connection = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(URL, username, password);

        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(storeConnection.class.getName()).log(Level.SEVERE, null, ex);
        }

        return connection;
    }
}
