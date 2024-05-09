// Import fs module's promises API
import fs from 'fs/promises';

// Function to read JSON data from a file
export async function read(filename) {
    try {
        // Read the file as a UTF-8 string
        const data = await fs.readFile(filename, 'utf-8');
        // Parse the data from JSON format and return it
        return JSON.parse(data);
    } catch (error) {
        // Handle file read errors
        if (error.code === 'ENOENT') {
            console.error(`File not found: ${filename}`);
        } else {
            console.error(`Error reading file ${filename}:`, error);
        }
        // Rethrow the error so it can be caught by the calling function
        throw error;
    }
}

// Function to write JSON data to a file
export async function write(filename, data) {
    try {
        // Convert data to JSON format with indentation for readability
        const jsonData = JSON.stringify(data, null, 2);
        // Write the JSON data to the specified file
        await fs.writeFile(filename, jsonData, 'utf-8');
        console.log(`File ${filename} written successfully.`);
    } catch (error) {
        // Handle file write errors
        console.error(`Error writing file ${filename}:`, error);
        // Rethrow the error so it can be caught by the calling function
        throw error;
    }
}
