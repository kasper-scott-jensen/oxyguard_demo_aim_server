import express from 'express'
import dotenv from 'dotenv'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import chalk from 'chalk'
import productRouter from './routers/product_router.js'
import partnerRouter from './routers/partner_router.js'
import formRouter from './routers/form_router.js'
import { initializeFirebase } from './config/firebase.config.js'
import { fetchLotsFromRackbeat } from './scripts/rackbeat.js'
import {
    setRackbeatFetchTimer,
    setDatabaseBackupTimer,
} from './scripts/cron.js'
import { fileURLToPath } from 'url'
import { startDatabaseBackup } from './scripts/backup.js'

// Initialize express application
const app = express()

// Load environment variables from .env file
dotenv.config()

// Get the current file and directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Firebase
initializeFirebase()

// Fetch initial data from Rackbeat and start the database backup process
fetchLotsFromRackbeat()
startDatabaseBackup()

// Set up cron jobs for periodic tasks
setRackbeatFetchTimer()
setDatabaseBackupTimer()

// Middleware setup
app.use(
    express.static(path.join(process.env.PUBLIC_DIR, 'public')),
    express.json(),
    multer().array(),
    cors({
        origin: '*',
    }),
    productRouter,
    partnerRouter,
    formRouter,
)

// Catch-All Route
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'html', 'catchall.html'))
})

// Start the server and listen on the specified port
const server = app.listen(process.env.SERVER_PORT, () => {
    console.log(chalk.blue('[server] running on port', server.address().port))
})
