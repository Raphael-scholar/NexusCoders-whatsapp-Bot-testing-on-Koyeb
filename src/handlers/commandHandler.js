const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

let commandCache = new Map();

const loadCommandsFromDirectory = async (directory) => {
    const commands = new Map();
    
    try {
        const items = await fs.readdir(directory, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(directory, item.name);
            
            if (item.isDirectory()) {
                const subCommands = await loadCommandsFromDirectory(fullPath);
                for (const [name, command] of subCommands) {
                    commands.set(name, command);
                }
            } else if (item.name.endsWith('.js')) {
                const command = require(fullPath);
                if (command.name && command.execute) {
                    commands.set(command.name, command);
                }
            }
        }
    } catch (error) {
        logger.error(`Error loading commands from ${directory}:`, error);
    }
    
    return commands;
};

const initializeCommands = async () => {
    try {
        const commandsPath = path.join(__dirname, '..', 'commands');
        await fs.ensureDir(commandsPath);
        
        commandCache = await loadCommandsFromDirectory(commandsPath);
        logger.info(`Loaded ${commandCache.size} commands successfully`);
        
        return commandCache;
    } catch (error) {
        logger.error('Failed to initialize commands:', error);
        return new Map();
    }
};

const searchCommands = async (commandName) => {
    return commandCache.get(commandName);
};

module.exports = {
    initializeCommands,
    searchCommands
};
