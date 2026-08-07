# Discover Assam Database Documentation

## Database Design Principles

### Overview
The Discover Assam database is designed with simplicity and flexibility in mind. Key design principles include:

- No complex foreign key relationships
- Use of UTF-8 character set for multilingual support
- Performance-optimized indexing
- Flexible schema to accommodate future expansions

### Database Configuration
- **Database Engine**: MySQL/MariaDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## Database Tables

### 1. Searches Table
- Tracks user search activities
- Helps understand user interests and improve search functionality

**Columns**:
- `id`: Unique identifier
- `search_term`: Search query
- `search_category`: Category of search
- `search_location`: Location context
- `search_count`: Number of times searched

### 2. Wildlife Table
- Comprehensive database of wildlife locations and sanctuaries

**Columns**:
- `id`: Unique identifier
- `name`: Location name
- `description`: Detailed description
- `location`: Specific location
- `district`: Administrative district
- `latitude`, `longitude`: Geographical coordinates
- `best_season`: Optimal visiting time
- `entry_fee`: Cost of entry
- `opening_hours`: Operating hours
- `animal_species`: Species present
- `conservation_status`: Current conservation state
- `image_urls`: Comma-separated image references
- `contact_info`: Contact details

### 3. Culture Table
- Captures cultural events, festivals, and traditions

**Columns**:
- `id`: Unique identifier
- `name`: Event/tradition name
- `type`: Category (Festival, Dance, Tradition)
- `description`: Detailed explanation
- `location`: Event location
- `district`: Administrative district
- `start_date`, `end_date`: Event timing
- `historical_significance`: Cultural context
- `cultural_importance`: Significance explanation
- `image_urls`: Comma-separated image references
- `contact_info`: Organizing contact details

### 4. Adventure Table
- Details adventure activities and experiences

**Columns**:
- `id`: Unique identifier
- `name`: Activity name
- `type`: Category (Rafting, Trekking, Safari)
- `description`: Activity details
- `location`: Activity location
- `district`: Administrative district
- `difficulty_level`: Skill requirement
- `duration`: Time needed
- `price`: Cost
- `includes`: What's provided
- `excludes`: What's not included
- `age_restrictions`: Age limits
- `fitness_level`: Physical requirements
- `best_season`: Optimal time
- `image_urls`: Comma-separated image references
- `contact_info`: Organizer contact

### 5. Packages Table
- Tourism and travel packages

**Columns**:
- `id`: Unique identifier
- `title`: Package name
- `type`: Package category
- `description`: Detailed package information
- `duration`: Trip length
- `original_price`, `discounted_price`: Pricing
- `discount_percentage`: Discount details
- `includes`: Package inclusions
- `excludes`: What's not included
- `itinerary`: Day-wise plan
- `locations_covered`: Destinations
- `best_time_to_visit`: Recommended period
- `group_size`: Participant limits
- `image_urls`: Comma-separated image references

### 6. News Table
- Latest news and updates about Assam

**Columns**:
- `id`: Unique identifier
- `title`: News headline
- `category`: News type
- `content`: Full article text
- `author`: Writer name
- `source`: Publication
- `published_date`: Timestamp
- `image_urls`: Comma-separated image references
- `tags`: Searchable keywords
- `views_count`: Popularity metric

### 7. Directory Table
- Business and service listings

**Columns**:
- `id`: Unique identifier
- `business_name`: Company/service name
- `category`, `subcategory`: Business classification
- `description`: Business details
- `address`: Physical location
- `district`: Administrative area
- `contact_number`: Phone
- `email`: Contact email
- `website`: Online presence
- `latitude`, `longitude`: Geographical coordinates
- `working_hours`: Operation timings
- `image_urls`: Comma-separated image references
- `rating`: User rating
- `reviews_count`: Number of reviews

### 8. Jobs Table
- Employment opportunities in Assam

**Columns**:
- `id`: Unique identifier
- `title`: Job position
- `company`: Employer
- `category`: Job type
- `type`: Employment type
- `location`, `district`: Job location
- `salary_min`, `salary_max`: Compensation range
- `experience_min`, `experience_max`: Required experience
- `skills_required`: Necessary skills
- `job_description`: Role details
- `responsibilities`: Key duties
- `qualifications`: Educational requirements
- `application_deadline`: Last date to apply
- `contact_email`: Application contact
- `views_count`: Job listing popularity
- `applications_count`: Number of applications

## Database Interaction

### Configuration
- Located in `config.php`
- Simple PDO-based database connection
- Environment-specific error handling

### Helper Functions
- `db_connect()`: Establishes database connection
- `db_select()`: Retrieve records
- `db_insert()`: Add new records
- `db_update()`: Modify existing records
- `db_delete()`: Remove records

### Example Usage
```php
// Insert a new wildlife location
$new_location = [
    'name' => 'New Wildlife Sanctuary',
    'description' => 'A newly discovered sanctuary',
    // ... other details
];
$new_id = db_insert('wildlife', $new_location);

// Retrieve locations
$locations = db_select('wildlife', ['district' => 'Golaghat']);

// Update a location
db_update('wildlife', 
    ['description' => 'Updated description'], 
    ['name' => 'Sanctuary Name']
);

// Delete a location
db_delete('wildlife', ['name' => 'Sanctuary Name']);
```

## Security Considerations
- PDO with prepared statements
- CSRF token generation and validation
- Input sanitization
- Error logging
- Development/Production environment handling

## Performance Optimization
- Indexed columns for faster queries
- Prepared statements
- Efficient data types
- Minimal normalization for flexibility

## Future Enhancements
- Implement full-text search
- Add caching mechanisms
- Develop more advanced query builders
- Implement more robust error handling

## Contribution
Please follow coding standards and add appropriate documentation when contributing to the database structure.