import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

// Use environment variable for public directory
const dbDir = process.env.DATABASE_DIR

// Define paths for databases and their backup folders
const dbPaths = [
    {
        dbPath: path.join(dbDir, 'crm.db'),
        backupFolderPath: path.join(dbDir, 'backup', 'crm'),
    },
    {
        dbPath: path.join(dbDir, 'rackbeat.db'),
        backupFolderPath: path.join(dbDir, 'backup', 'rackbeat'),
    },
]

// Function to create a backup of a database
const createBackup = async (dbPath, backupFolderPath) => {
    const date = new Date()
    const timestamp = date.toISOString().replace(/[:.]/g, '-')
    const dbName = path.basename(dbPath, '.db')
    const backupFileName = `${dbName}-backup-${timestamp}.db`
    const backupFilePath = path.join(backupFolderPath, backupFileName)
    try {
        // Copy the database to the backup location
        await fs.copy(dbPath, backupFilePath)
        console.log(
            chalk.green(`[server] database backup created: ${backupFileName}`),
        )

        // Get the list of backup files in the folder
        const files = await fs.readdir(backupFolderPath)

        // If there are more than 30 backup files, delete the oldest ones
        if (files.length > 30) {
            files.sort((a, b) => {
                const aTime = fs.statSync(path.join(backupFolderPath, a)).ctime
                const bTime = fs.statSync(path.join(backupFolderPath, b)).ctime
                return aTime - bTime
            })
            const filesToDelete = files.slice(0, files.length - 30)
            for (const file of filesToDelete) {
                await fs.remove(path.join(backupFolderPath, file))
                console.log(
                    chalk.yellow(
                        `[server] old database backup deleted: ${file}`,
                    ),
                )
            }
        }
    } catch (err) {
        // Log any errors that occur during the backup process
        console.error('Error creating backup:', err)
    }
}

// Function to start the database backup process
export function startDatabaseBackup() {
    dbPaths.forEach(({ dbPath, backupFolderPath }) =>
        createBackup(dbPath, backupFolderPath),
    )
}
