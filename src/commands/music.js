// src/commands/music.js
const { playSong, pauseSong, resumeSong, skipSong, printQueue, disconnect } = require('./musicCommands.js');

module.exports = function (client) {
    const queue = new Map();

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

        const args = message.content.split(' ');
        const command = args[0];
        const song = args.slice(1).join(' ');

        switch (command) {
            case '!play':
                playSong(message, song, queue);
                break;
            case '!pause':
                pauseSong(message, queue);
                break;
            case '!resume':
                resumeSong(message, queue);
                break;
            case '!skip':
                skipSong(message, queue);
                break;
            case '!queue':
                printQueue(message, queue);
                break;
            case '!disconnect':
                disconnect(message, queue);
                break;
            default:
                message.reply('Unknown command.');
        }
    });
}