import axios from 'axios'
import cheerio from 'cheerio'
import { URL } from 'url'
import chalk from 'chalk'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// Define search terms to look for on partner websites
const searchTerms = [
    'universal',
    'kassow',
    'fanuc',
    'abb',
    'doosan',
    'kuka',
    'omron',
]

// Function to fetch data from the partners table in the database
async function fetchPartnersTable() {
    const db = await openDatabase('crm')
    try {
        const result = await db.all(`
            SELECT
                p.id,
                p.company,
                p.country_code,
                p.phone,
                p.email,
                p.address,
                p.city,
                p.country,
                p.website,
                p.img_url,
                h.universal,
                h.kassow,
                h.tm_omron,
                h.kuka,
                h.fanuc,
                h.abb,
                h.doosan
            FROM partners p
            LEFT JOIN hcl h ON p.hcl = h.id
        `)
        const partners = result.map((data) => ({
            id: data.id,
            company: data.company,
            country_code: data.country_code,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            country: data.country,
            website: data.website,
            img_url: data.img_url,
            hcl: {
                universal: data.universal,
                kassow: data.kassow,
                tm_omron: data.tm_omron,
                kuka: data.kuka,
                abb: data.abb,
                fanuc: data.fanuc,
                doosan: data.doosan,
            },
        }))
        return partners
    } catch (error) {
        console.log(
            chalk.red('[server] ', 'error fetching partners table: ', error),
        )
    } finally {
        await db.close()
    }
}

// Function to update the HCL table with the search results
async function writeToPartnersHcl(results) {
    const db = await openDatabase('crm')
    try {
        await db.run('BEGIN TRANSACTION')
        for (const result of results) {
            const { id, universal, kassow, omron, fanuc, abb, doosan, kuka } =
                result
            await db.run(
                `UPDATE hcl SET 
                    universal = ?, 
                    kassow = ?, 
                    tm_omron = ?, 
                    fanuc = ?, 
                    abb = ?, 
                    doosan = ?, 
                    kuka = ? 
                WHERE id = ?`,
                [universal, kassow, omron, fanuc, abb, doosan, kuka, id],
            )
        }
        await db.run('COMMIT')
    } catch (error) {
        console.error('Error updating hcl table:', error)
        await db.run('ROLLBACK')
    } finally {
        await db.close()
    }
}

// Function to open the database
async function openDatabase(filename) {
    return open({
        filename: `../database/${filename}.db`,
        driver: sqlite3.Database,
    })
}

// Function to fetch HTML content from a given URL
async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url)
        return cheerio.load(data)
    } catch (error) {
        console.error(chalk.red(`Error fetching ${url}: ${error.message}`))
        return null
    }
}

// Function to check if the search terms are present on a page
async function checkPage(url, $) {
    const bodyText = $('body').text().toLowerCase()
    const result = {}
    searchTerms.forEach((term) => {
        result[term] = bodyText.includes(term.toLowerCase()) ? 1 : 0
    })
    return result
}

// Function to extract navigation links from a page
function extractLinks(url, $) {
    const links = new Set()

    const navSelectors = [
        'nav a[href]',
        'header a[href]',
        'footer a[href]',
        'a.nav-link[href]',
        'a.menu-link[href]',
    ]

    navSelectors.forEach((selector) => {
        $(selector).each((_, element) => {
            const href = $(element).attr('href')
            if (
                href &&
                (href.startsWith('http://') ||
                    href.startsWith('https://') ||
                    href.startsWith('/'))
            ) {
                try {
                    const absoluteUrl = new URL(href, url).href
                    if (absoluteUrl.startsWith(url)) {
                        links.add(absoluteUrl)
                    }
                } catch (error) {
                    console.warn(`Invalid URL skipped: ${href}`)
                }
            }
        })
    })

    return Array.from(links)
}

// Function to check an entire website by visiting multiple pages
async function checkWebsite(url) {
    const results = {}
    let pagesToVisit = [url]
    const visitedPages = new Set()
    let pagesChecked = 0
    let timeoutReached = false

    const timeout = new Promise((resolve) => {
        setTimeout(() => {
            timeoutReached = true
            resolve('timeout')
        }, 4000)
    })

    const processPages = async () => {
        while (pagesToVisit.length > 0) {
            const currentPage = pagesToVisit.pop()
            if (visitedPages.has(currentPage)) {
                continue
            }

            visitedPages.add(currentPage)
            const $ = await fetchHTML(currentPage)
            if (!$) continue

            const pageResult = await checkPage(currentPage, $)
            searchTerms.forEach((term) => {
                if (results[term] === undefined) {
                    results[term] = 0
                }
                results[term] = Math.max(results[term], pageResult[term])
            })

            if (!timeoutReached) {
                const links = extractLinks(url, $)
                pagesToVisit = pagesToVisit.concat(
                    links.filter((link) => !visitedPages.has(link)),
                )
            }

            pagesChecked++
            console.log(
                chalk.yellow(
                    `Progress for ${url}: ${pagesChecked}/${pagesChecked + pagesToVisit.length} pages checked`,
                ),
            )
        }
        return 'completed'
    }

    await Promise.race([processPages(), timeout])
    if (timeoutReached) {
        console.log(chalk.red(`Timeout reached for ${url}`))
    }
    await processPages()
    return results
}

// Main function to traverse partner websites and collect search results
async function traverseWebsites() {
    const partners = await fetchPartnersTable()
    const results = []
    const totalPartners = partners.length
    let completedPartners = 0

    for (const partner of partners) {
        console.log(
            chalk.blue(
                `Checking website for partner: ${partner.company} (${completedPartners + 1}/${totalPartners})`,
            ),
        )
        const searchResults = await checkWebsite(partner.website)
        if (searchResults) {
            const result = { id: partner.id, ...searchResults }
            results.push(result)
        }
        completedPartners++
        console.log(
            chalk.green(
                `Overall progress: ${((completedPartners / totalPartners) * 100).toFixed(2)}%`,
            ),
        )
    }

    return results
}

// Execute the main function and write results to the database
;(async () => {
    const results = await traverseWebsites()
    console.log('Final Results:')
    console.log(JSON.stringify(results, null, 2))
    await writeToPartnersHcl(results)
})()
