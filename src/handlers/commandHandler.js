const fs = require('fs-extra');
const path = require('path');
const NodeCache = require('node-cache');
const config = require('../config');
const logger = require('../utils/logger');
const { checkPermissions } = require('../utils/permissions');

const commands = new Map();
const cooldowns = new NodeCache({ stdTTL: 30 });

async function initializeCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const categories = await fs.readdir(commandsPath);

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = (await fs.readdir(categoryPath)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(categoryPath, file));
            commands.set(command.name, command);
        }
    }
}

async function executeCommand(messageInfo, commandName, args) {
    const { sock, msg, sender, isGroup, groupMetadata, user } = messageInfo;
    const command = commands.get(commandName);
    
    if (!command) return;

    const cooldownKey = `${sender}-${commandName}`;
    if (cooldowns.has(cooldownKey)) {
        const timeLeft = cooldowns.getTtl(cooldownKey) - Date.now();
        await sock.sendMessage(sender, {
            text: config.messages.cooldown.replace('{time}', Math.ceil(timeLeft / 1000))
        });
        return;
    }

    try {
        const permissionCheck = await checkPermissions(messageInfo, command);
        if (!permissionCheck.granted) {
            await sock.sendMessage(sender, { text: permissionCheck.message });
            return;
        }

        await command.execute(messageInfo, args);
        cooldowns.set(cooldownKey, true, command.cooldown || 3);
    } catch (error) {
        logger.error(`Command execution error (${commandName}):`, error);
        await sock.sendMessage(sender, { text: config.messages.error });
    }
}

module.exports = {
    initializeCommands,
    executeCommand
};
