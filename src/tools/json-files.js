
    import fs from 'fs/promises';


    export async function read(filename) {
        try {

            const data = await fs.readFile(filename, 'utf-8');

            return JSON.parse(data);
        } catch (error) {

            if (error.code === 'ENOENT') {
                console.error(`File not found: ${filename}`);
            } else {
                console.error(`Error reading file ${filename}:`, error);
            }

            throw error;
        }
    }


    export async function write(filename, data) {
        try {

            const jsonData = JSON.stringify(data, null, 2);

            await fs.writeFile(filename, jsonData, 'utf-8');
            console.log(`File ${filename} written successfully.`);
        } catch (error) {

            console.error(`Error writing file ${filename}:`, error);

            throw error;
        }
    }
