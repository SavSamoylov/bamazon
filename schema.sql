DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE departments(
  department_id INT(10) AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(30) NOT NULL,
  over_head_costs DECIMAL(10,2) DEFAULT 0
);

-- TEST THAT "departments" WAS CREATED
SELECT * FROM departments;

CREATE TABLE products(
  item_id INT(10) AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(30) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  stock_quantity INT(10) DEFAULT 0,
  product_sales DECIMAL(10,2) DEFAULT 0,
  department_id INT(10),
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- TEST THAT "products" WAS CREATED
SELECT * FROM products;


-- POPULATE TABLES
INSERT INTO departments (department_name, over_head_costs) VALUES
('Mens', 5000), ('Sportswear', 7500), ('Jewelry', 10000), ('Toys', 4500), ('Handbags', 5500);

INSERT INTO products (product_name, price, stock_quantity, product_sales, department_id) VALUES
("Men's Polo", 29.99, 150, 0, 1),
("Men's Jeans", 49.99, 200, 0, 1),
("Cold-Shoulder Top", 39.99, 150, 0, 2),
("Pleated Skirt", 39.99, 150, 0, 2),
("Diamond Ring", 699.99, 10, 0, 3),
("Gold Watch", 199.99, 15, 0, 3),
("Magic Carpet", 999.99, 12, 0, 4),
("Barbie's Dream House", 69.99, 30, 0, 4),
("Coach Tote", 199.99, 10, 0, 5),
("Michael Kors XB", 99.99, 15, 0, 5);
