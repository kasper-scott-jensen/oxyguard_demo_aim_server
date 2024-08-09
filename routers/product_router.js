import dotenv from 'dotenv' // Import dotenv to manage environment variables
import chalk from 'chalk' // Import chalk for colored console output
import { Router } from 'express' // Import Router from express to create routes
import { header, validationResult } from 'express-validator' // Import express-validator for request validation
import { fetchProductsTable } from '../scripts/query_products.js' // Import database query to fetch products
import { addUrlsToProducts } from '../scripts/products.js' // Import script to add URLs to products

// Initialize dotenv to read environment variables from the .env file
dotenv.config()

// Create an instance of an Express Router
const router = Router()

// Route handler for fetching current products
router.get(
    '/api/products/current', // Define the GET route for current products
    [header('secret-key').equals(process.env.SECRET_KEY)], // Validate the 'secret-key' header
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400) // Return a 400 status for bad request
                .json({ errors: validationResult(req).errors }) // Send validation errors in response
        }
        try {
            const products = await fetchProductsTable(true)
            const productsWithUrls = await addUrlsToProducts(products)
            res.status(200).json({ products: productsWithUrls })
        } catch (error) {
            res.status(400).json({ error: error.message })
            console.log(chalk.red('[api] ', 'error sending products: ', error))
        }
    },
)

// Route handler for fetching all products
router.get(
    '/api/products/all', // Define the GET route for all products
    [header('secret-key').equals(process.env.SECRET_KEY)], // Validate the 'secret-key' header
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400) // Return a 400 status for bad request
                .json({ errors: validationResult(req).errors }) // Send validation errors in response
        }
        try {
            const products = await fetchProductsTable(false)
            const productsWithUrls = await addUrlsToProducts(products)
            res.status(200).json({ products: productsWithUrls })
        } catch (error) {
            res.status(400).json({ error: error.message })
            console.log(chalk.red('[api] ', 'error sending products: ', error))
        }
    },
)

export default router // Export the router for use in the main application
