const processMessage = async (sock, msg) => {
    const messageContent = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || 
                         msg.message?.imageMessage?.caption || 
                         msg.message?.videoMessage?.caption;
                         
    return {
        content: messageContent || '',
        sender: msg.key.remoteJid,
        isGroup: msg.key.remoteJid.endsWith('@g.us'),
        quotedMessage: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
        mentionedJids: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    };
};

module.exports = { processMessage };
