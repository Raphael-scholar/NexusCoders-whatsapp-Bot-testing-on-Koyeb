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
let initialConnection = true;
const sessionDir = path.join(process.cwd(), 'auth_info_baileys');

async function ensureDirectories() {
    const dirs = [
        sessionDir,
        'temp',
        'assets',
        'logs'
    ];
    
    for (const dir of dirs) {
        await fs.ensureDir(dir);
    }
    
    await fs.emptyDir(sessionDir);
}

async function displayBanner() {
    return new Promise((resolve) => {
        figlet(config.botName, {
            font: 'Standard',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }, function(err, data) {
            if (!err) {
                console.log(gradient.rainbow(data));
                console.log(gradient.pastel('\n' + '='.repeat(50) + '\n'));
                console.log(gradient.cristal(`${config.botName} v${config.version}`));
                console.log(gradient.pastel('\n' + '='.repeat(50) + '\n'));
            }
            resolve();
        });
    });
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
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
        qrTimeout: 40000,
        markOnlineOnConnect: true,
        getMessage: async () => {
            return { conversation: config.botName };
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'connecting') {
            logger.info('Establishing connection...');
        }
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                logger.info('Reconnecting to WhatsApp...');
                setTimeout(connectToWhatsApp, 5000);
            } else {
                logger.error('Connection terminated. Cleaning up...');
                await fs.emptyDir(sessionDir);
            }
        }
        
        if (connection === 'open') {
            if (initialConnection) {
                initialConnection = false;
                const startupMsg = await startupMessage();
                try {
                    await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
                        text: startupMsg,
                        contextInfo: {
                            externalAdReply: {
                                title: config.botName,
                                body: `Version ${config.version}`,
                                thumbnail: await fs.readFile('./assets/thumbnail.jpg'),
                                sourceUrl: config.sourceUrl
                            }
                        }
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
                        logger.error('Message handling error:', error);
                    }
                }
            }
        }
    });

    return sock;
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
        await ensureDirectories();
        await connectToDatabase();
        await initializeCommands();
        await connectToWhatsApp();
        await startServer();
        
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Rejection:', err);
        });
        
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
        });
    } catch (error) {
        logger.error('Initialization error:', error);
        process.exit(1);
    }
}

initialize();
