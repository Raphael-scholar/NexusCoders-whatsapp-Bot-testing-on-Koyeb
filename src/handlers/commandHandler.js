const fs = require('fs-extra');
const path = require('path');

const commands = new Map();

const loadCommands = async (dir) => {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
            await loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const command = require(fullPath);
            commands.set(command.name, command);
        }
    }
};

const initializeCommands = async () => {
    try {
        const commandsPath = path.join(__dirname, '..', 'commands');
        await loadCommands(commandsPath);
        return commands;
    } catch (error) {
        return new Map();
    }
};

const getCommands = () => commands;

module.exports = {
    initializeCommands,
    getCommands
};
