<?php
require_once '../config.php';

function import_dummy_data() {
    $dummy_data_files = [
        '../database/dummy_data.sql',
        '../database/dummy_data_continued.sql',
        '../database/dummy_data_final.sql'
    ];

    $pdo = db_connect();

    foreach ($dummy_data_files as $file) {
        if (!file_exists($file)) {
            echo "Error: File $file not found.\n";
            continue;
        }

        $sql = file_get_contents($file);
        
        try {
            // Remove SQL comments and empty lines
            $sql = preg_replace('/^--.*$/m', '', $sql);
            $sql = preg_replace('/^\s*$/m', '', $sql);

            // Split SQL into individual statements
            $statements = array_filter(explode(';', $sql));

            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (!empty($statement)) {
                    $stmt = $pdo->prepare($statement);
                    $stmt->execute();
                }
            }

            echo "Successfully imported data from $file\n";
        } catch (PDOException $e) {
            echo "Error importing data from $file: " . $e->getMessage() . "\n";
        }
    }
}

// Check if script is run from CLI
if (php_sapi_name() === 'cli') {
    import_dummy_data();
} else {
    echo "This script should be run from the command line.";
}