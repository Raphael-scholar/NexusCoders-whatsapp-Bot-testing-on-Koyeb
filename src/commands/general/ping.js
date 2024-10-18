module.exports = {
    name: 'ping',
    description: 'Check bot latency',
    cooldown: 5,
    execute: async (sock, msg) => {
        const start = Date.now();
        await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pinging...' });
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🏓 Pong!\nLatency: ${Date.now() - start}ms` 
        });
    }
};

