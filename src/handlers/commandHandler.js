const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const loadCommands = async () => {
    const commands = new Map();
    const commandsPath = path.join(__dirname, '..', 'commands');
    const categories = await fs.readdir(commandsPath);
    
    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = await fs.readdir(categoryPath);
        
        for (const file of commandFiles) {
            try {
                const command = require(path.join(categoryPath, file));
                command.category = category;
                commands.set(command.name, command);
                
                if (command.aliases) {
                    command.aliases.forEach(alias => commands.set(alias, command));
                }
            } catch (error) {
                logger.error(`Error loading command ${file}:`, error);
            }
        }
    }
    
    return commands;
};

const initializeCommands = async () => {
    try {
        const commands = await loadCommands();
        logger.info(`Loaded ${commands.size} commands`);
        return commands;
    } catch (error) {
        logger.error('Failed to initialize commands:', error);
        process.exit(1);
    }
};

module.exports = { initializeCommands };
