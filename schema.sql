-- Threadix Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS threadix;
USE threadix;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    imgUrl VARCHAR(255) DEFAULT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    `desc` TEXT,
    category VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    salePrice DECIMAL(10, 2),
    stock BOOLEAN DEFAULT TRUE,
    isFeatured BOOLEAN DEFAULT FALSE,
    size JSON, -- Array of strings
    colors JSON, -- Array of strings
    images JSON, -- Array of strings
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES categories(name) ON DELETE SET NULL
);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
    userId INT PRIMARY KEY,
    items JSON, -- Array of objects: [{productId, quantity, color, size}]
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    items JSON NOT NULL, -- Array of objects
    totalPrice DECIMAL(10, 2) NOT NULL,
    shippingPrice DECIMAL(10, 2) DEFAULT 0,
    paymentMethod VARCHAR(50),
    paymentStatus ENUM('paid', 'unpaid', 'refunded') DEFAULT 'unpaid',
    orderStatus ENUM('pending', 'in delivery', 'completed', 'cancelled') DEFAULT 'pending',
    address TEXT NOT NULL,
    note TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
