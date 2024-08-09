import dotenv from 'dotenv'
import chalk from 'chalk'

// Load environment variables from .env file
dotenv.config()

// Function to find the newest revisions of lots
export function findNewestLotRevisions(lots) {
    // Process each lot to extract the serial number and revision
    const processedLots = lots.map(splitLotNumber)

    // Reduce the processed lots to find the newest revisions
    const newestLotRevisions = processedLots.reduce((accumulator, current) => {
        const [serialNumber, revision] = current.number.split('.')

        // Compare the current revision with the stored one and update if newer
        if (
            !accumulator[serialNumber] ||
            compareRevisions(
                revision,
                accumulator[serialNumber].number.split('.')[1],
            ) > 0
        ) {
            accumulator[serialNumber] = current
        }
        return accumulator
    }, {})

    // Return the newest lot revisions
    return Object.values(newestLotRevisions)
}

// Function to split lot number into serial number and revision
export function splitLotNumber(lot) {
    const [serialNumber, revision] = lot.number.split('.')
    return {
        ...lot,
        node_id: serialNumber,
        node_revision: revision,
    }
}

// Function to compare two revisions
function compareRevisions(rev1, rev2) {
    const letter1 = rev1[0]
    const letter2 = rev2[0]
    const number1 = parseInt(rev1.slice(1), 10)
    const number2 = parseInt(rev2.slice(1), 10)

    // Compare the letters
    if (letter1 > letter2) return 1
    if (letter1 < letter2) return -1

    // If letters are the same, compare the numbers
    return number1 - number2
}

// Function to add URLs to product media
export async function addUrlsToProducts(data) {
    try {
        // Iterate over each item and update URLs
        data.forEach((item) => {
            if (item.media.setup_vid_url) {
                item.media.setup_vid_url = `${process.env.SERVER}/videos/setup/${item.media.setup_vid_url}`
            }
            if (item.media.blueprint) {
                item.media.blueprint = `${process.env.SERVER}/images/blueprints/${item.media.blueprint}`
            }
        })

        // Return the updated data
        return data
    } catch (error) {
        // Log error if updating URLs fails
        console.log(
            chalk.red('[server] ', 'error adding urls to products: ', error),
        )
    }
}
