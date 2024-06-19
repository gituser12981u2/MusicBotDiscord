const logger = require('../logger.js');
const { playSong, pauseSong, resumeSong, skipSong, printQueue, disconnect } = require('./musicCommands.js');

/**
 * Register music commands with the Discord client
 * @param {Object} client - The Discord client
 */
module.exports = function (client) {
    const queue = new Map();

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        const args = message.content.split(' ');
        const command = args[0];
        const song = args.slice(1).join(' ');

        logger.info(`Received command: ${command}`);

        switch (command) {
            case '!play':
                logger.info('Executing !play command');
                playSong(client, message, song, queue);
                break;
            case '!pause':
                logger.info('Executing !pause command');
                pauseSong(message, queue);
                break;
            case '!resume':
                logger.info('Executing !resume command');
                resumeSong(message, queue);
                break;
            case '!skip':
                logger.info('Executing !skip command');
                skipSong(message, queue);
                break;
            case '!queue':
                logger.info('Executing !queue command');
                printQueue(message, queue);
                break;
            case '!disconnect':
                logger.info('Executing !disconnect command');
                disconnect(message, queue);
                break;
            default:
                logger.info('Unknown command');
                message.reply('Unknown command.');
        }
    });
}