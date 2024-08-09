// Import the sqlite3 library for interacting with SQLite databases
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
// Import the chalk library for adding color to console output
import chalk from 'chalk'
// Import the open function from sqlite for opening database connections in a promise-based manner
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

// Export an asynchronous function to fetch data from the products table
export async function fetchProductsTable(current) {
    // Open a database connection to the 'rackbeat' database
    const db = await openDatabase('rackbeat')
    try {
        // Determine the SQL WHERE clause based on the 'current' parameter
        const clause = current ? 'WHERE p.is_current = 1' : ''
        // Execute a SQL query to fetch products, optionally filtering for current products
        const result = await db.all(`
            SELECT
                p.id,
                p.revision,
                p.name,
                p.name_sub,
                p.desc_short,
                p.desc_long,
                p.related_products,
                p.sw_version,
                p.blueprint,
                p.img_url,
                p.is_current,
                p.setup_vid_url,
                p.interface,
                c.id as category_id,
                c.category,
                h.compat_universal,
                h.compat_kassow,
                h.compat_tm_omron,
                h.compat_kuka,
                h.compat_abb,
                h.compat_fanuc,
                h.compat_doosan,
                b.badge_1,
                b.badge_2,
                b.badge_3,
                b.badge_4,
                d.protocol_universal,
                d.protocol_kassow,
                d.protocol_tm_omron,
                d.protocol_kuka,
                d.protocol_abb,
                d.protocol_fanuc,
                d.protocol_doosan,
                d.datasheet,
                d.files,
                d.manual,
                d.software_universal,
                d.software_kassow,
                d.software_tm_omron,
                d.software_kuka,
                d.software_abb,
                d.software_fanuc,
                d.software_doosan,
                f.feature_1,
                f.feature_2,
                f.feature_3,
                f.feature_4,
                f.feature_5,
                q.faq_1,
                q.faq_2,
                q.faq_3,
                q.faq_4,
                q.faq_5
            FROM products p
            LEFT JOIN categories c ON p.category = c.id
            LEFT JOIN hcl h ON p.hcl = h.id
            LEFT JOIN badges b ON p.badges = b.id
            LEFT JOIN docs d ON p.docs = d.id
            LEFT JOIN features f ON p.features = f.id
            LEFT JOIN faq q ON p.faq = q.id
            ${clause}
        `)
        // Map the result to a structured format
        const products = result.map((data) => ({
            id: data.id,
            revision: data.revision,
            name: data.name,
            category: data.category,
            category_id: data.category_id - 1,
            sw_version: data.sw_version,
            is_current: data.is_current,
            interface: data.interface,
            related_products: data.related_products,
            description: {
                name_sub: data.name_sub,
                desc_short: data.desc_short,
                desc_long: data.desc_long,
            },
            media: {
                blueprint: data.blueprint,
                img_url: data.img_url,
                setup_vid_url: data.setup_vid_url,
            },
            hcl: {
                universal: data.compat_universal,
                kassow: data.compat_kassow,
                tm_omron: data.compat_tm_omron,
                kuka: data.compat_kuka,
                abb: data.compat_abb,
                fanuc: data.compat_fanuc,
                doosan: data.compat_doosan,
            },
            badges: [data.badge_1, data.badge_2, data.badge_3, data.badge_4],
            docs: {
                protocols: {
                    universal: data.protocol_universal,
                    kassow: data.protocol_kassow,
                    tm_omron: data.protocol_tm_omron,
                    kuka: data.protocol_kuka,
                    abb: data.protocol_abb,
                    fanuc: data.protocol_fanuc,
                    doosan: data.protocol_doosan,
                },
                datasheet: data.datasheet,
                files: data.files,
                manual: data.manual,
                software: {
                    universal: data.software_universal,
                    kassow: data.software_kassow,
                    tm_omron: data.software_tm_omron,
                    kuka: data.software_kuka,
                    abb: data.software_abb,
                    fanuc: data.software_fanuc,
                    doosan: data.software_doosan,
                },
            },
            features: [
                data.feature_1,
                data.feature_2,
                data.feature_3,
                data.feature_4,
                data.feature_5,
            ],
            faq: [data.faq_1, data.faq_2, data.faq_3, data.faq_4, data.faq_5],
        }))
        // Return the structured products data
        return products
    } catch (error) {
        // Log an error message if the query fails
        console.log(
            chalk.red('[server] ', 'error fetching products table: ', error),
        )
    } finally {
        // Ensure the database connection is closed
        await db.close()
    }
}

// Define an asynchronous function to update the products table with data from Rackbeat
export async function updateProductsTableFromRackbeat(lots) {
    // Open a database connection to the 'rackbeat' database
    const db = await openDatabase('rackbeat')
    try {
        // Begin a database transaction to ensure data integrity
        await db.run('BEGIN TRANSACTION;')
        // Use Promise.all to execute multiple asynchronous operations in parallel
        await Promise.all(
            // Map each lot to an asynchronous operation
            lots.map(async (lot) => {
                // Destructure the lot object to extract necessary fields
                const {
                    id,
                    number,
                    urlfriendly_number,
                    type,
                    barcode,
                    name,
                    description,
                    sales_price,
                    recommended_sales_price,
                    sales_profit,
                    cost_price,
                    recommended_cost_price,
                    cost_addition_percentage,
                    default_location_id,
                    stock_quantity,
                    in_order_quantity,
                    available_quantity,
                    purchased_quantity,
                    used_in_production_quantity,
                    min_order,
                    min_sales,
                    min_stock,
                    min_produced,
                    picture_url,
                    pictures,
                    inventory_enabled,
                    recommended_cost_is_locked,
                    cost_is_locked,
                    is_barred,
                    adjust_to_zero,
                    group_id,
                    discount_group,
                    unit_id,
                    pdf_url,
                    created_at,
                    updated_at,
                    deleted_at,
                    node_id,
                    node_revision,
                } = lot
                // Execute an SQL INSERT operation for each lot, with an ON CONFLICT clause to handle duplicates
                db.run(
                    `INSERT INTO products (id, revision, name, desc_short, img_url) 
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        revision = excluded.revision,
                        name = excluded.name,
                        desc_short = excluded.desc_short,
                        img_url = excluded.img_url`,
                    // Provide the values for the SQL parameters
                    [
                        node_id,
                        node_revision,
                        name,
                        description,
                        pictures.original,
                    ],
                )
            }),
        )
        // Commit the transaction to save the changes to the database
        await db.run('COMMIT;')
        // Log a success message indicating the products table has been updated
        console.log(
            chalk.green('[server] products table updated with rackbeat data'),
        )
    } catch (error) {
        // Log an error message if the update operation fails
        console.log(
            chalk.red(
                '[server] ',
                'error updating products table with rackbeat data: ',
                error,
            ),
        )
    } finally {
        // Ensure the database connection is closed
        await db.close()
    }
}
