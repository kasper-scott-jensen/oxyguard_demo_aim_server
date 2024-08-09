import dotenv from 'dotenv' // Import dotenv to manage environment variables
import chalk from 'chalk' // Import chalk for colored console output
import { Router } from 'express' // Import Router from express to create routes
import { header, validationResult } from 'express-validator' // Import express-validator for request validation
import { addUrlsToPartners } from '../scripts/partners.js' // Import custom script to add URLs to partners
import { fetchPartnersTable } from '../scripts/query_partners.js' // Import database query to fetch partners

// Initialize dotenv to read environment variables from the .env file
dotenv.config()

// Create an instance of an Express Router
const router = Router()

// Route handler for fetching all partners
router.get(
    '/api/partners/all', // Define the GET route
    [header('secret-key').equals(process.env.SECRET_KEY)], // Validate the 'secret-key' header
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400) // Return a 400 status for bad request
                .json({ errors: validationResult(req).errors }) // Send validation errors in response
        }
        try {
            // Fetch partners from the database
            const partners = await fetchPartnersTable()
            // Add URLs to the partners
            const partnersWithUrls = await addUrlsToPartners(partners)
            // Send the modified partners list in the response
            res.status(200).json({ partners: partnersWithUrls })
        } catch (error) {
            // Handle errors and send a 400 status with error message
            res.status(400).json({ error: error.message })
            // Log the error using chalk for colored output
            console.log(chalk.red('[api] ', 'error sending partners: ', error))
        }
    },
)

export default router // Export the router for use in the main application
