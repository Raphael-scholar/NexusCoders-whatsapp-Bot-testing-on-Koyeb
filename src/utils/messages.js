const config = require('../config');

const startupMessage = async () => {
    return `╭━━━━━━━━━━━━━━━━━━━━╮
┃  ${config.botName} ONLINE!  ┃
╰━━━━━━━━━━━━━━━━━━━━╯

Bot Version: ${config.version}
Prefix: ${config.prefix}
Mode: ${process.env.NODE_ENV || 'development'}
Time: ${new Date().toLocaleString()}

Bot is ready to use!
Type ${config.prefix}help for commands list.

${config.footer}`;
};

module.exports = { startupMessage };
