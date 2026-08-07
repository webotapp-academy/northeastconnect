-- Discover Assam Database Tables

-- Disable foreign key checks for clean setup
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS searches;
DROP TABLE IF EXISTS wildlife;
DROP TABLE IF EXISTS culture;
DROP TABLE IF EXISTS adventure;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS directory;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create Searches Table (Central Search Index)
CREATE TABLE searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    search_category VARCHAR(100) NOT NULL,
    search_location VARCHAR(255),
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_count INT DEFAULT 1,
    INDEX idx_search_term (search_term),
    INDEX idx_search_category (search_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Wildlife Table
CREATE TABLE wildlife (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    best_season VARCHAR(100),
    entry_fee DECIMAL(10, 2),
    opening_hours VARCHAR(255),
    animal_species TEXT,
    conservation_status VARCHAR(100),
    image_urls TEXT,
    contact_info VARCHAR(255),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Culture Table
CREATE TABLE culture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Festival', 'Tradition', 'Art', 'Music', 'Dance', 'Heritage') NOT NULL,
    description TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    start_date DATE,
    end_date DATE,
    historical_significance TEXT,
    cultural_importance TEXT,
    image_urls TEXT,
    contact_info VARCHAR(255),
    status ENUM('Active', 'Upcoming', 'Past') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Adventure Table
CREATE TABLE adventure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Trekking', 'River Rafting', 'Camping', 'Wildlife Safari', 'Cycling', 'Paragliding', 'Other') NOT NULL,
    description TEXT,
    location VARCHAR(255),
    district VARCHAR(100),
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    duration VARCHAR(100),
    price DECIMAL(10, 2),
    includes TEXT,
    excludes TEXT,
    age_restrictions VARCHAR(100),
    fitness_level VARCHAR(100),
    best_season VARCHAR(100),
    image_urls TEXT,
    contact_info VARCHAR(255),
    status ENUM('Available', 'Unavailable') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_location (location),
    INDEX idx_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Packages Table
CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('Wildlife', 'Cultural', 'Adventure', 'Leisure', 'Honeymoon', 'Family', 'Group') NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    original_price DECIMAL(10, 2),
    discounted_price DECIMAL(10, 2),
    discount_percentage INT,
    includes TEXT,
    excludes TEXT,
    itinerary TEXT,
    locations_covered TEXT,
    best_time_to_visit VARCHAR(100),
    group_size VARCHAR(100),
    image_urls TEXT,
    status ENUM('Active', 'Sold Out', 'Upcoming') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_price (discounted_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create News Table
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('Tourism', 'Culture', 'Events', 'Government', 'Travel', 'Business', 'Environment') NOT NULL,
    content TEXT,
    author VARCHAR(255),
    source VARCHAR(255),
    published_date TIMESTAMP,
    image_urls TEXT,
    tags TEXT,
    views_count INT DEFAULT 0,
    status ENUM('Published', 'Draft', 'Archived') DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_published_date (published_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Directory Table (Business Listings)
CREATE TABLE directory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    category ENUM('Hospitality', 'Healthcare', 'Education', 'Professional Services', 'Retail', 'Arts', 'Agriculture', 'Technology', 'Food', 'Travel') NOT NULL,
    subcategory VARCHAR(255),
    description TEXT,
    address VARCHAR(500),
    district VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    working_hours VARCHAR(255),
    image_urls TEXT,
    rating DECIMAL(3, 2),
    reviews_count INT DEFAULT 0,
    status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_district (district),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    category ENUM('Government', 'Private', 'IT', 'Education', 'Healthcare', 'Tourism', 'Startup', 'NGO', 'Manufacturing') NOT NULL,
    type ENUM('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship') NOT NULL,
    location VARCHAR(255),
    district VARCHAR(100),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    experience_min INT,
    experience_max INT,
    skills_required TEXT,
    job_description TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    application_deadline DATE,
    contact_email VARCHAR(255),
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    status ENUM('Open', 'Closed', 'Pending') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_location (location),
    INDEX idx_deadline (application_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    mobile_number VARCHAR(15),
    profile_image_url VARCHAR(500),
    role ENUM('User', 'Business', 'Admin', 'Moderator') DEFAULT 'User',
    last_login TIMESTAMP NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP NULL,
    status ENUM('Active', 'Suspended', 'Deleted') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('Wildlife', 'Culture', 'Adventure', 'Package', 'Directory') NOT NULL,
    entity_id INT NOT NULL,
    user_id INT,
    rating DECIMAL(3, 2) NOT NULL,
    review_text TEXT,
    status ENUM('Approved', 'Pending', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Bookings Table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('Package', 'Adventure', 'Wildlife') NOT NULL,
    entity_id INT NOT NULL,
    user_id INT,
    full_name VARCHAR(255),
    email VARCHAR(255),
    mobile_number VARCHAR(15),
    booking_date DATE,
    number_of_persons INT,
    total_price DECIMAL(10, 2),
    payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    booking_status ENUM('Confirmed', 'Cancelled', 'Completed') DEFAULT 'Confirmed',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id),
    INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Add some initial data or sample entries
INSERT INTO searches (search_term, search_category, search_location) VALUES 
('Kaziranga', 'Wildlife', 'Assam'),
('Bihu Festival', 'Culture', 'Assam');

-- Indexes for performance optimization
CREATE INDEX idx_searches_term_category ON searches(search_term, search_category);
CREATE INDEX idx_wildlife_name ON wildlife(name);
CREATE INDEX idx_culture_name ON culture(name);
CREATE INDEX idx_adventure_name ON adventure(name);
CREATE INDEX idx_packages_title ON packages(title);
CREATE INDEX idx_news_title ON news(title);
CREATE INDEX idx_directory_name ON directory(business_name);
CREATE INDEX idx_jobs_title ON jobs(title);