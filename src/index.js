const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, Events, GatewayIntentBits } = require('discord.js');
const logger = require('./logger');

// Create a new Discord client instance with specific intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Import music commands module
require('./commands/music')(client);

// Log when the client is ready
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}!`);
    logger.info(`Ready! Logged in as ${c.user.tag}!`);
});

// Login to Discord with bot token
client.login(process.env.DISCORD_BOT_TOKEN);