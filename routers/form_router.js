import dotenv from 'dotenv'
import chalk from 'chalk'
import { Router } from 'express'
import { header, body, validationResult } from 'express-validator'
import {
    sendSupportFormSubmissionToHubspot,
    sendContactFormSubmissionToHubspot,
    sendPartnerFormSubmissionToHubspot,
} from '../scripts/hubspot.js'

// Initialize dotenv to read environment variables from the .env file
dotenv.config()

// Create an Express Router instance
const router = Router()

// Route handler for the contact form submission
router.post(
    '/api/forms/contact',
    [
        // Validate request headers and body
        header('secret-key').equals(process.env.SECRET_KEY),
        body('firstName').isString(),
        body('lastName').isString(),
        body('email').isString(),
        body('phone').isString(),
        body('industry').isString(),
        body('company').isString(),
        body('country').isString(),
        body('city').isString(),
        body('product').isString(),
        body('state').isString(),
        body('message').isString(),
    ],
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400)
                .json({ errors: validationResult(req).errors })
        }
        try {
            // Send contact form submission to HubSpot
            await sendContactFormSubmissionToHubspot(req.body)
            res.status(200).json({ message: 'contact form data received' })
        } catch (error) {
            // Handle errors and send error response
            res.status(400).json({ error: error.message })
            console.log(
                chalk.red(
                    '[api] ',
                    'error receiving contact form data: ',
                    error,
                ),
            )
        }
    },
)

// Route handler for the support form submission
router.post(
    '/api/forms/support',
    [
        // Validate request headers and body
        header('secret-key').equals(process.env.SECRET_KEY),
        body('firstName').isString(),
        body('lastName').isString(),
        body('email').isString(),
        body('phone').isString(),
        body('company').isString(),
        body('country').isString(),
        body('state').isString(),
        body('city').isString(),
        body('product').isString(),
        body('topic').isString(),
        body('message').isString(),
    ],
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400)
                .json({ errors: validationResult(req).errors })
        }
        try {
            // Send support form submission to HubSpot
            await sendSupportFormSubmissionToHubspot(req.body)
            res.status(200).json({ message: 'support form data received' })
        } catch (error) {
            // Handle errors and send error response
            res.status(400).json({ error: error.message })
            console.log(
                chalk.red(
                    '[api] ',
                    'error receiving support form data: ',
                    error,
                ),
            )
        }
    },
)

// Route handler for the partner form submission
router.post(
    '/api/forms/partner',
    [
        // Validate request headers and body
        header('secret-key').equals(process.env.SECRET_KEY),
        body('firstName').isString(),
        body('lastName').isString(),
        body('email').isString(),
        body('phone').isString(),
        body('company').isString(),
        body('city').isString(),
        body('country').isString(),
        body('state').isString(),
        body('industry').isString(),
        body('message').isString(),
    ],
    async (req, res) => {
        // Check if there are validation errors
        if (!validationResult(req).isEmpty()) {
            return res
                .status(400)
                .json({ errors: validationResult(req).errors })
        }
        try {
            // Send partner form submission to HubSpot
            await sendPartnerFormSubmissionToHubspot(req.body)
            res.status(200).json({ message: 'partner form data received' })
        } catch (error) {
            // Handle errors and send error response
            res.status(400).json({ error: error.message })
            console.log(
                chalk.red(
                    '[api] ',
                    'error receiving partner form data: ',
                    error,
                ),
            )
        }
    },
)

export default router
