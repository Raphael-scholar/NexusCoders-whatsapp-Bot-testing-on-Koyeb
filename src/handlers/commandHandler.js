const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const initializeCommands = async () => {
    const commands = new Map();
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    try {
        await fs.ensureDir(commandsPath);
        const commandFiles = await fs.readdir(commandsPath);
        
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const command = require(path.join(commandsPath, file));
                commands.set(command.name, command);
            }
        }
        
        return commands;
    } catch (error) {
        logger.error('Failed to initialize commands:', error);
        return new Map();
    }
};

module.exports = { initializeCommands };
