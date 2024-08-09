import chalk from 'chalk'

// Function to add URLs to partner images
export async function addUrlsToPartners(data) {
    try {
        // Iterate over each item in the data array
        data.forEach((item) => {
            // If the item has an image URL, update it with the server path
            if (item.img_url) {
                item.img_url = `${process.env.SERVER}/images/partners/${item.img_url}`
            }
        })
        // Return the updated data
        return data
    } catch (error) {
        // Log error if updating URLs fails
        console.log(
            chalk.red('[server] ', 'error adding urls to partners: ', error),
        )
    }
}
