//src/index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, Events, GatewayIntentBits } = require('discord.js');
const logger = require('./logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

require('./commands/music')(client);

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}!`);
    logger.info(`Ready! Logged in as ${c.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);