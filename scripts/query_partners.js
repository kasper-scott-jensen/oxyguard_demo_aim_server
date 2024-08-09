// Import the sqlite3 module
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'

// Import the chalk module
import chalk from 'chalk'
// Import the open function from the sqlite module
import { open } from 'sqlite'
import path from 'path'

// Asynchronously open a database connection
async function openDatabase(filename) {
    // Construct the database file path using the environment variable
    const dbPath = `${process.env.DATABASE_DIR}/${filename}.db`

    // Open the database connection using the open function
    return open({
        // Specify the filename of the database
        filename: dbPath,
        // Specify the driver of the database
        driver: sqlite3.Database,
    })
}

// Asynchronously fetch data from the partners table
export async function fetchPartnersTable() {
    // Open a database connection
    const db = await openDatabase('crm')
    try {
        // Fetch all data from the partners table
        const result = await db.all(`
            SELECT
                p.id,
                p.company,
                p.country_code,
                p.phone,
                p.email,
                p.address,
                p.longitude,
                p.latitude,
                p.city,
                p.country,
                p.website,
                p.img_url,
                p.is_integrator,
                h.universal,
                h.kassow,
                h.tm_omron,
                h.kuka,
                h.fanuc,
                h.abb,
                h.doosan,
                h.aim_robotics
            FROM partners p
            LEFT JOIN hcl h ON p.hcl = h.id
        `)
        // Map the fetched data to an array of partner objects
        const partners = result.map((data) => ({
            id: data.id,
            company: data.company,
            country_code: data.country_code,
            phone: data.phone,
            email: data.email,
            longitude: data.longitude,
            latitude: data.latitude,
            address: data.address,
            city: data.city,
            country: data.country,
            website: data.website,
            img_url: data.img_url,
            is_integrator: data.is_integrator,
            hcl: {
                universal: data.universal,
                kassow: data.kassow,
                tm_omron: data.tm_omron,
                kuka: data.kuka,
                abb: data.abb,
                fanuc: data.fanuc,
                doosan: data.doosan,
                aim_robotics: data.aim_robotics,
            },
        }))
        // Return the array of partner objects
        return partners
    } catch (error) {
        // Log an error message
        console.log(
            chalk.red('[server] ', 'error fetching partners table: ', error),
        )
    } finally {
        // Close the database connection
        await db.close()
    }
}
