import admin from 'firebase-admin'
import serviceAccount from './service_account_key.json' assert { type: 'json' }

export const initializeFirebase = async () => {
    await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}
