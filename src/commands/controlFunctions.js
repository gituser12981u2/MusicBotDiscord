// src/commands/controlFunctions.js
const { AudioPlayerStatus } = require('@discordjs/voice');

function pauseSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.send('There is nothing playing.');

    if (serverQueue && serverQueue.player.state.status !== AudioPlayerStatus.Paused) {
        serverQueue.player.pause(true);
        return message.channel.send('⏸ Paused the music.');
    }
}

function resumeSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.send('There is nothing playing.');

    if (serverQueue && serverQueue.player.state.status === AudioPlayerStatus.Paused) {
        serverQueue.player.unpause();
        return message.channel.send('▶ Resumed the music.');
    }
}

function skipSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (serverQueue === 0) return message.send('There is no song playing.');

    serverQueue.player.stop();
}

function disconnect(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('I am not conected to the voice channel.');

    serverQueue.songs = [];
    serverQueue.player.stop();
}

module.exports = {
    pauseSong,
    resumeSong,
    skipSong,
    disconnect,
};
