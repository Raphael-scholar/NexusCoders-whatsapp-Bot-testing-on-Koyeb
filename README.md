# NexusCoders WhatsApp Bot

A powerful,fast and feature-rich WhatsApp bot created by the NexusCoders team.

![NexusCoders Team Logo](https://tiny.one/ycktdvah)

## Features

- Easy to deploy on Render
- Customizable commands
- Rate limiting to prevent spam
- Logging system for easy debugging
- SQLite database for user management
- Weather information command
- Extensible command system

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A WhatsApp account
- OpenWeatherMap API key (for weather command)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/nexuscoders-whatsapp-bot.git
   cd nexuscoders-whatsapp-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   SESSION_ID=your_session_id
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   ```

## Getting the Session ID
[![WhatsApp Pairing](https://img.shields.io/badge/WhatsApp-Scan%20QR%20Code-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://nexuscoderssessionid.onrender.com/)
1. Follow the instructions to pair your WhatsApp account using the QR code or other provided methods.
2. Once paired, you will receive a session ID. Copy this ID.
3. Add the session ID to your `.env` file as shown in the installation step.

## Deployment on Render

1. Fork this repository to your GitHub account.
2. Create a new Web Service on Render.
3. Connect your forked GitHub repository.
4. Set the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the following environment variables:
   - `SESSION_ID`: The value you obtained from the session ID generation step
   - `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key
6. Deploy the app.

## Usage

To start the bot locally:

```
npm start
```

The bot will now be active on your WhatsApp account. Use the prefix `!` to interact with the bot (e.g., `!help`, `!weather New York`).

## Available Commands

- `!help`: List all available commands
- `!ping`: Check bot responsiveness
- `!weather <city>`: Get weather information for a city

## Creating New Commands

1. Create a new file in the `src/commands` folder (e.g., `mycommand.js`).
2. Use the following template:

```javascript
module.exports = {
    name: 'mycommand',
    description: 'Description of my command',
    execute(message, args) {
        // Command logic here
    },
};
```

3. The command will be automatically loaded and available for use.

## Configuration

You can modify the `src/config.js` file to change various settings such as the command prefix, rate limiting, and bot information.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the GitHub repository or contact the NexusCoders team.
