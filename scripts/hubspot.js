import axios from 'axios'
import chalk from 'chalk'
import dotenv from 'dotenv'
import qs from 'qs'

// Load environment variables from .env file
dotenv.config()

// Base URL for HubSpot form submissions
const baseUrl = 'https://api.hsforms.com/submissions/v3/integration/submit'

// Configuration for Axios requests
const config = {
    headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
    },
}

// Function to send contact form submission to HubSpot
export async function sendContactFormSubmissionToHubspot(formData) {
    try {
        const data = {
            fields: [
                { name: 'firstname', value: formData.firstName },
                { name: 'lastname', value: formData.lastName },
                { name: 'email', value: formData.email },
                { name: 'phone', value: formData.phone },
                {
                    name: 'which_industry_are_you_in_',
                    value: formData.industry,
                },
                { name: 'company', value: formData.company },
                { name: 'country', value: formData.country },
                { name: 'city', value: formData.city },
                {
                    name: 'which_tool_are_you_interested_in_',
                    value: formData.product,
                },
                { name: 'state', value: formData.state },
                { name: 'message', value: formData.message },
            ],
        }
        await axios.post(
            `${baseUrl}/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_CONTACT_FORM_GUID}`,
            data,
            config,
        )
    } catch (error) {
        // Log error if form submission fails
        console.log(
            chalk.red('[server] ', 'error submitting contact form: ', error),
        )
    }
}

// Function to send support form submission to HubSpot
export async function sendSupportFormSubmissionToHubspot(formData) {
    try {
        const data = {
            fields: [
                { name: 'firstname', value: formData.firstName },
                { name: 'lastname', value: formData.lastName },
                { name: 'email', value: formData.email },
                { name: 'phone', value: formData.phone },
                { name: 'company', value: formData.company },
                { name: 'country', value: formData.country },
                { name: 'city', value: formData.city },
                { name: 'state', value: formData.state },
                { name: 'tool___part', value: formData.product },
                { name: 'TICKET.subject', value: formData.topic },
                { name: 'TICKET.content', value: formData.message },
            ],
        }
        await axios.post(
            `${baseUrl}/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_SUPPORT_FORM_GUID}`,
            data,
            config,
        )
    } catch (error) {
        // Log error if form submission fails
        console.log(
            chalk.red('[server] ', 'error submitting support form: ', error),
        )
    }
}

// Function to send partner form submission to HubSpot
export async function sendPartnerFormSubmissionToHubspot(formData) {
    try {
        const data = {
            fields: [
                { name: 'firstname', value: formData.firstName },
                { name: 'lastname', value: formData.lastName },
                { name: 'email', value: formData.email },
                { name: 'phone', value: formData.phone },
                { name: 'company', value: formData.company },
                { name: 'country', value: formData.country },
                { name: 'city', value: formData.city },
                { name: 'state', value: formData.state },
                {
                    name: 'which_industry_are_you_in_',
                    value: formData.industry,
                },
                { name: 'message', value: formData.message },
            ],
        }
        await axios.post(
            `${baseUrl}/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_PARTNER_FORM_GUID}`,
            data,
            config,
        )
    } catch (error) {
        // Log error if form submission fails
        console.log(
            chalk.red('[server] ', 'error submitting support form: ', error),
        )
    }
}
