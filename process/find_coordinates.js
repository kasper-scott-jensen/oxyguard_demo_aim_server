// Import axios for making HTTP requests and the function to fetch partner data from the database
import axios from 'axios'
import { fetchPartnersTable } from '../database/queries/partners.js'
import dotenv from 'dotenv'

dotenv.config()

// Define the access token for the Mapbox API
const accessToken = process.env.MAPBOX_ACCESS_TOKEN

// Define an asynchronous function to geocode an address using the Mapbox API
async function geocode(address) {
    // Construct the URL for the Mapbox geocoding API, encoding the address
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`
    try {
        // Make a GET request to the Mapbox API
        const response = await axios.get(url)
        const data = response.data
        // Check if the response contains geocoding data
        if (data.features && data.features.length > 0) {
            // Extract the longitude and latitude from the first feature
            const [longitude, latitude] = data.features[0].geometry.coordinates
            // Return the coordinates
            return { latitude, longitude }
        } else {
            // Throw an error if no results were found
            throw new Error('No results found')
        }
    } catch (error) {
        // Return null coordinates if an error occurs
        return { latitude: null, longitude: null }
    }
}

// Define an asynchronous function to fetch partner data and geocode their addresses
async function fetchAndGeocodePartners() {
    try {
        // Fetch the list of partners from the database
        const partners = await fetchPartnersTable()
        // Iterate over each partner
        for (const partner of partners) {
            // Construct the full address from the partner's data
            const address = `${partner.address}, ${partner.city}, ${partner.country}`
            // Geocode the address
            const coords = await geocode(address)
            // Log the address and its coordinates
            console.log(
                `Address: ${address}, Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`,
            )
        }
    } catch (error) {
        // Log an error message if fetching partners or geocoding fails
        console.error('Error fetching partners:', error)
    }
}

// Call the function to fetch and geocode partner addresses
fetchAndGeocodePartners()
