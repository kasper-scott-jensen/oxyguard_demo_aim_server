import axios from 'axios'
import chalk from 'chalk'
import { findNewestLotRevisions } from './products.js'
import { updateProductsTableFromRackbeat } from './query_products.js'

// Function to fetch lots from Rackbeat API
export async function fetchLotsFromRackbeat() {
    try {
        // Configuration for the Rackbeat API request
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.RACKBEAT_API_KEY}`,
            },
        }

        // Fetch lots data from Rackbeat API with a limit of 100 lots
        const response = await axios.get(
            'https://app.rackbeat.com/api/lots?limit=100',
            config,
        )

        // Find the newest lot revisions from the fetched data
        const newestLotRevisions = findNewestLotRevisions(response.data.lots)

        // Update the products table with the newest lot revisions
        updateProductsTableFromRackbeat(newestLotRevisions)

        // Log success message
        console.log(chalk.green('[server] data fetched from rackbeat'))
    } catch (error) {
        // Log error message if fetching data fails
        console.log(
            chalk.red('[server] ', 'error fetching rackbeat data: ', error),
        )
    }
}
