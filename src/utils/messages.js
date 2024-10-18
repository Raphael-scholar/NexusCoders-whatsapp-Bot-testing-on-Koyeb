const moment = require('moment-timezone');
const config = require('../config');
const os = require('os');

async function startupMessage() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const timezone = moment.tz.guess();
    const date = moment().tz(timezone).format('MMMM Do YYYY, h:mm:ss a');
    
    return `🤖 *${config.botName} Online!* 🚀\n\n` +
           `📅 *Date:* ${date}\n` +
           `⏰ *Timezone:* ${timezone}\n` +
           `💻 *System:* ${os.platform()} ${os.release()}\n` +
           `🧮 *Memory:* ${formatBytes(memory.heapUsed)} / ${formatBytes(memory.heapTotal)}\n` +
           `⚡ *Uptime:* ${formatUptime(uptime)}\n\n` +
           `✨ *Version:* ${config.version}\n` +
           `🛠️ *Prefix:* ${config.prefix}\n\n` +
           `Type *${config.prefix}help* for commands list`;
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = {
    startupMessage
};
