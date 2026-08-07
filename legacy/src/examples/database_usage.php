<?php
require_once '../config.php';

// Example: Inserting a new wildlife location
function add_wildlife_location($data) {
    try {
        $id = db_insert('wildlife', $data);
        echo "New wildlife location added with ID: $id\n";
        return $id;
    } catch (PDOException $e) {
        error_log("Error adding wildlife location: " . $e->getMessage());
        return false;
    }
}

// Example: Retrieving wildlife locations
function get_wildlife_locations($conditions = [], $columns = '*') {
    try {
        $locations = db_select('wildlife', $conditions, $columns);
        return $locations;
    } catch (PDOException $e) {
        error_log("Error retrieving wildlife locations: " . $e->getMessage());
        return [];
    }
}

// Example: Updating a wildlife location
function update_wildlife_location($data, $conditions) {
    try {
        $affected_rows = db_update('wildlife', $data, $conditions);
        echo "Updated $affected_rows wildlife location(s)\n";
        return $affected_rows;
    } catch (PDOException $e) {
        error_log("Error updating wildlife location: " . $e->getMessage());
        return false;
    }
}

// Example: Deleting a wildlife location
function delete_wildlife_location($conditions) {
    try {
        $affected_rows = db_delete('wildlife', $conditions);
        echo "Deleted $affected_rows wildlife location(s)\n";
        return $affected_rows;
    } catch (PDOException $e) {
        error_log("Error deleting wildlife location: " . $e->getMessage());
        return false;
    }
}

// Demonstration of usage
if (php_sapi_name() === 'cli') {
    // Sample data for demonstration
    $new_location = [
        'name' => 'New Wildlife Sanctuary',
        'description' => 'A newly discovered wildlife sanctuary',
        'location' => 'Unknown District',
        'district' => 'Experimental',
        'latitude' => 26.5000,
        'longitude' => 92.9000,
        'best_season' => 'Year-round',
        'entry_fee' => 50.00,
        'opening_hours' => '6:00 AM - 6:00 PM',
        'animal_species' => 'Various',
        'conservation_status' => 'Under Study',
        'image_urls' => 'new_sanctuary1.jpg,new_sanctuary2.jpg',
        'contact_info' => '+91 0000 000000'
    ];

    // Demonstrate insert
    $new_id = add_wildlife_location($new_location);

    // Demonstrate select
    if ($new_id) {
        $locations = get_wildlife_locations(['name' => 'New Wildlife Sanctuary']);
        print_r($locations);

        // Demonstrate update
        update_wildlife_location(
            ['description' => 'Updated description of the sanctuary'],
            ['name' => 'New Wildlife Sanctuary']
        );

        // Demonstrate delete
        delete_wildlife_location(['name' => 'New Wildlife Sanctuary']);
    }
}