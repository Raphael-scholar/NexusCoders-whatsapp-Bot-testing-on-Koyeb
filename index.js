require('dotenv').config();
const {
    default: makeWASocket,
    Browsers,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const NodeCache = require('node-cache');
const gradient = require('gradient-string');
const figlet = require('figlet');
const { connectToDatabase } = require('./src/utils/database');
const logger = require('./src/utils/logger');
const messageHandler = require('./src/handlers/messageHandler');
const config = require('./src/config');
const { initializeCommands } = require('./src/handlers/commandHandler');
const { startupMessage } = require('./src/utils/messages');

const msgRetryCounterCache = new NodeCache();
const app = express();
let sock = null;
let initialConnection = true;
let isConnecting = false;
const sessionDir = path.join(process.cwd(), 'auth_info_baileys');
const MAX_RETRIES = 5;
let retryCount = 0;

async function displayBanner() {
    return new Promise((resolve, reject) => {
        figlet(config.botName, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(gradient.rainbow(data));
            resolve();
        });
    });
}

async function ensureDirectories() {
    const dirs = [sessionDir, 'temp', 'assets', 'logs'];
    for (const dir of dirs) {
        await fs.ensureDir(dir);
    }
}

async function writeSessionData() {
    if (!process.env.SESSION_DATA) {
        throw new Error('SESSION_DATA environment variable is required');
    }

    try {
        const sessionData = JSON.parse(Buffer.from(process.env.SESSION_DATA, 'base64').toString('utf-8'));
        await fs.emptyDir(sessionDir);
        await fs.ensureDir(sessionDir);
        await fs.writeJSON(path.join(sessionDir, 'creds.json'), sessionData);
        return true;
    } catch (error) {
        logger.error('Failed to write session data:', error);
        throw error;
    }
}

async function createDefaultThumbnail() {
    const defaultThumbnailPath = './assets/thumbnail.jpg';
    const defaultThumbnailData = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');
    await fs.writeFile(defaultThumbnailPath, defaultThumbnailData);
}

async function connectToWhatsApp() {
    if (isConnecting) return;
    isConnecting = true;

    try {
        await ensureDirectories();
        await createDefaultThumbnail();
        await writeSessionData();
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version } = await fetchLatestBaileysVersion();
        
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger: P({ level: 'silent' }),
            browser: Browsers.appropriate('Chrome'),
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            retryRequestDelayMs: 5000,
            maxRetries: 5,
            qrTimeout: 60000,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async () => {
                return { conversation: config.botName };
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                isConnecting = false;
                
                if (shouldReconnect && retryCount < MAX_RETRIES) {
                    retryCount++;
                    logger.info(`Reconnecting... Attempt ${retryCount}`);
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    logger.error('Connection closed. Max retries reached or logged out.');
                    process.exit(1);
                }
            }
            
            if (connection === 'open') {
                retryCount = 0;
                isConnecting = false;
                logger.info('Connected to WhatsApp');
                
                if (initialConnection) {
                    initialConnection = false;
                    const startupMsg = await startupMessage();
                    try {
                        await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
                            text: startupMsg
                        });
                    } catch (error) {
                        logger.error('Failed to send startup message:', error);
                    }
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('messages.upsert', async chatUpdate => {
            if (chatUpdate.type === 'notify') {
                for (const msg of chatUpdate.messages) {
                    if (!msg.key.fromMe) {
                        try {
                            await messageHandler(sock, msg);
                        } catch (error) {
                            logger.error('Message handler error:', error);
                            if (error.message.includes('Session closed')) {
                                process.exit(1);
                            }
                        }
                    }
                }
            }
        });

        return sock;
    } catch (error) {
        isConnecting = false;
        logger.error('Connection error:', error);
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            logger.info(`Retrying connection... Attempt ${retryCount}`);
            setTimeout(connectToWhatsApp, 5000);
        } else {
            logger.error('Max retries reached. Exiting...');
            process.exit(1);
        }
    }
}

async function startServer() {
    const port = process.env.PORT || 3000;
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.get('/', (req, res) => {
        res.send(`${config.botName} is running!`);
    });
    
    app.listen(port, '0.0.0.0', () => {
        logger.info(`Server running on port ${port}`);
    });
}

async function initialize() {
    try {
        await displayBanner();
        await connectToDatabase();
        await initializeCommands();
        await connectToWhatsApp();
        await startServer();
        
        process.on('unhandledRejection', (error) => {
            logger.error('Unhandled rejection:', error);
            if (error.message.includes('Session closed')) {
                process.exit(1);
            }
        });
        
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception:', error);
            process.exit(1);
        });
    } catch (error) {
        logger.error('Initialization error:', error);
        process.exit(1);
    }
}

initialize();
