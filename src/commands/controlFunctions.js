const { AudioPlayerStatus } = require('@discordjs/voice');

/**
 * Pause the current song
 * @param {Object} message - The message object 
 * @param {Map} queue - The song queue
 */
function pauseSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('There is nothing playing.');

    logger.info('Attempting to pause the audio player...')
    if (serverQueue.player.state.status == AudioPlayerStatus.Playing) {
        serverQueue.player.pause(true);
        return message.channel.send('⏸ Paused the music.');
    } else {
        return message.channel.send('The music is already paused or not playing.');
    }
}

/**
 * Resume the paused song
 * @param {Object} message - The message object
 * @param {Map} queue - The song queue
 */
function resumeSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('There is nothing playing.');

    logger.info('Attempting to resume the audio player...')
    if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
        serverQueue.player.unpause();
        return message.channel.send('▶ Resumed the music.');
    } else {
        return message.channel.send('The music is not paused.');
    }
}

/**
 * Skip the current song
 * @param {Object} message - The message object
 * @param {Map} queue - The song queue
 */
function skipSong(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('There is no song playing.');

    const currentSong = serverQueue.songs.shift();
    if (serverQueue.songs.length > 0) {
        const nextSong = serverQueue.songs[0];
        serverQueue.player.stop();
        return message.channel.send(`⏭ Skipped the song. Now playing: **${nextSong.title}**`);
    } else {
        serverQueue.player.stop();
        return message.channel.send('⏭ Skipped the song. There are no more songs in the queue.');
    }
}

/**
 * Disconnect the bot from the voice channel
 * @param {Object} message - The message object
 * @param {Map} queue - The song queue
 */
function disconnect(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('I am not connected to the voice channel.');

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);
    return message.channel.send(`Disconnected from the voice channel.`);
}

module.exports = {
    pauseSong,
    resumeSong,
    skipSong,
    disconnect,
};
