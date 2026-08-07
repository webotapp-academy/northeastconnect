-- Discover Assam Database Structure

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS searches;
DROP TABLE IF EXISTS wildlife;
DROP TABLE IF EXISTS culture;
DROP TABLE IF EXISTS adventure;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS directory;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Search Table (Central Search Index)
CREATE TABLE searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_name VARCHAR(255) NOT NULL,
    search_cat_type VARCHAR(100) NOT NULL,
    search_category_table_name VARCHAR(100) NOT NULL,
    search_category_rel_id INT NOT NULL,
    search_keywords TEXT,
    search_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wildlife Table
CREATE TABLE wildlife (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    best_time_to_visit VARCHAR(100),
    image_url VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    difficulty_level ENUM('Easy', 'Moderate', 'Challenging'),
    entry_fee DECIMAL(10, 2),
    contact_info VARCHAR(255),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Culture Table
CREATE TABLE culture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Festival', 'Tradition', 'Art', 'Music', 'Dance'),
    description TEXT,
    location VARCHAR(255),
    date_of_occurrence DATE,
    duration VARCHAR(100),
    image_url VARCHAR(500),
    historical_significance TEXT,
    status ENUM('Active', 'Upcoming', 'Past') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adventure Table
CREATE TABLE adventure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('Trekking', 'River Rafting', 'Camping', 'Wildlife Safari', 'Cycling', 'Other'),
    description TEXT,
    location VARCHAR(255),
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    duration VARCHAR(100),
    price DECIMAL(10, 2),
    includes TEXT,
    excludes TEXT,
    image_url VARCHAR(500),
    contact_info VARCHAR(255),
    status ENUM('Available', 'Unavailable') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages Table
CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('Wildlife', 'Cultural', 'Adventure', 'Leisure', 'Honeymoon'),
    description TEXT,
    duration VARCHAR(100),
    original_price DECIMAL(10, 2),
    discounted_price DECIMAL(10, 2),
    discount_percentage INT,
    includes TEXT,
    excludes TEXT,
    itinerary TEXT,
    image_url VARCHAR(500),
    best_time_to_visit VARCHAR(100),
    status ENUM('Active', 'Sold Out', 'Upcoming') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Table
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('Tourism', 'Culture', 'Events', 'Government', 'Travel', 'Other'),
    content TEXT,
    author VARCHAR(255),
    source_url VARCHAR(500),
    image_url VARCHAR(500),
    published_date TIMESTAMP,
    tags TEXT,
    status ENUM('Published', 'Draft', 'Archived') DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Directory Table (Business Listings)
CREATE TABLE directory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    category ENUM('Hospitality', 'Healthcare', 'Education', 'Professional Services', 'Retail', 'Arts', 'Agriculture', 'Technology'),
    subcategory VARCHAR(255),
    description TEXT,
    address VARCHAR(500),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    working_hours VARCHAR(255),
    image_url VARCHAR(500),
    status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    category ENUM('Government', 'Private', 'IT', 'Education', 'Healthcare', 'Tourism', 'Startup', 'NGO'),
    type ENUM('Full-time', 'Part-time', 'Contract', 'Freelance'),
    location VARCHAR(255),
    salary_range VARCHAR(100),
    experience_required VARCHAR(100),
    skills_required TEXT,
    job_description TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    application_deadline DATE,
    contact_email VARCHAR(255),
    status ENUM('Open', 'Closed', 'Pending') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (for future authentication and personalization)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('User', 'Admin', 'Moderator') DEFAULT 'User',
    profile_image_url VARCHAR(500),
    last_login TIMESTAMP,
    status ENUM('Active', 'Suspended', 'Deleted') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_searches_name ON searches(search_name);
CREATE INDEX idx_searches_category ON searches(search_cat_type);
CREATE INDEX idx_wildlife_location ON wildlife(location);
CREATE INDEX idx_culture_type ON culture(type);
CREATE INDEX idx_adventure_type ON adventure(type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_directory_category ON directory(category);