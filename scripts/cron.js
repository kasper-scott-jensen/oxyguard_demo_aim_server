import cron from 'node-cron'
import { fetchLotsFromRackbeat } from './rackbeat.js'
import { startDatabaseBackup } from './backup.js'

// Function to set a timer to fetch lots from Rackbeat every day at midnight
export function setRackbeatFetchTimer() {
    cron.schedule('0 0 * * *', fetchLotsFromRackbeat)
}

// Function to set a timer to start the database backup process every day at 11:50 PM
export function setDatabaseBackupTimer() {
    cron.schedule('50 23 * * *', startDatabaseBackup)
}
