<?php
// Database Configuration
class Database {
    private $host = 'localhost';
    private $db_name = 'discover_assam';
    private $username = 'root';
    private $password = '';
    private $conn;

    // Database Connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                $this->username, 
                $this->password
            );
            
            // Set the PDO error mode to exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Enable UTF-8 support
            $this->conn->exec("SET NAMES utf8mb4");
        } catch(PDOException $exception) {
            // Log error or handle connection failure
            error_log("Database Connection Error: " . $exception->getMessage());
            throw new Exception("Database connection failed.");
        }

        return $this->conn;
    }

    // Singleton pattern to prevent multiple connections
    public static function getInstance() {
        static $instance = null;
        if ($instance === null) {
            $instance = new self();
        }
        return $instance;
    }

    // Prevent direct cloning
    private function __clone() {}

    // Prevent unserialize
    public function __wakeup() {}

    // Helper method to safely execute queries
    public function executeQuery($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            error_log("Query Execution Error: " . $e->getMessage());
            return false;
        }
    }

    // Method to insert data
    public function insert($table, $data) {
        $keys = array_keys($data);
        $values = array_values($data);

        $placeholders = implode(', ', array_fill(0, count($keys), '?'));
        $columns = implode(', ', $keys);

        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($values);
            return $this->conn->lastInsertId();
        } catch(PDOException $e) {
            error_log("Insert Error: " . $e->getMessage());
            return false;
        }
    }

    // Method to update data
    public function update($table, $data, $where) {
        $set = [];
        $values = [];

        foreach ($data as $key => $value) {
            $set[] = "$key = ?";
            $values[] = $value;
        }

        $whereConditions = [];
        foreach ($where as $key => $value) {
            $whereConditions[] = "$key = ?";
            $values[] = $value;
        }

        $sql = "UPDATE $table SET " . implode(', ', $set) . " WHERE " . implode(' AND ', $whereConditions);

        try {
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute($values);
        } catch(PDOException $e) {
            error_log("Update Error: " . $e->getMessage());
            return false;
        }
    }
}

// Global function to get database connection
function getDbConnection() {
    return Database::getInstance()->getConnection();
}

// Error handling configuration
ini_set('display_errors', 1);
error_reporting(E_ALL);