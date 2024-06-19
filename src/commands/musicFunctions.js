const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core')
const { search, video_info } = require('play-dl');
const { pauseSong, resumeSong, skipSong, disconnect } = require('./controlFunctions');
const { EmbedBuilder } = require('discord.js');
const logger = require('../logger');

/**
 * Play a song or search for a song to play
 * @param {Object} client - The Discord client 
 * @param {Object} message - The message object 
 * @param {string} urlOrSearchTerm - The URL or search term for the song
 * @param {Map} queue - The song queue
 * @returns possible errors
 */
async function playSong(client, message, urlOrSearchTerm, queue) {
    const guildId = message.guild.id;
    let url = urlOrSearchTerm;
    let songInfo;

    // Check if the input is a URL or a search term
    if (!url.startsWith('http')) {
        const searchResults = await search(urlOrSearchTerm, { limit: 1 });
        if (searchResults.length === 0) {
            message.reply('No results found for your search.');
            return;
        }
        url = searchResults[0].url;
        songInfo = searchResults[0];
        logger.info(songInfo);
    } else {
        // check if valid yt URL
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            message.reply('Only YouTube links are supported.');
            return;
        }
        songInfo = await video_info(url);
    }

    const song = {
        title: songInfo.video_details?.title || songInfo.title,
        url: songInfo.video_details?.url || songInfo.url,
        thumbnail: songInfo.video_details?.thumbnails[0].url || songInfo.thumbnails[0].url,
        duration: songInfo.video_details?.durationRaw || songInfo.durationRaw,
        request: message.author.tag,
    };

    const serverQueue = queue.get(guildId);
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: message.member.voice.channel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
            player: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            })
        };

        queue.set(guildId, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            queueConstruct.connection = connection;

            connection.on('stateChange', (oldState, newState) => {
                logger.info(`Voice connection transitioned from ${oldState.status} to ${newState.status}`);
                if (newState.status === 'ready') {
                    logger.info('Voice connection is ready!');
                }
            });

            queueConstruct.connection.subscribe(queueConstruct.player);
            play(client, guildId, queueConstruct.songs[0], queue);
        } catch (err) {
            console.log(err);
            queue.delete(guildId);
            message.channel.send('An error occurred while trying to play the song.');
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

/**
 * Play the current song in the queue
 * @param {Object} client - The Discord client
 * @param {string} guildId - The ID of the guild
 * @param {Object} song - The song object
 * @param {Map} queue  - The song queue
 */
async function play(client, guildId, song, queue) {
    const serverQueue = queue.get(guildId);
    if (!song) {
        setTimeout(() => {
            if (serverQueue.songs.length === 0 && serverQueue.connection.state.status !== "destroyed") {
                serverQueue.connection.destroy();
                queue.delete(guildId);
            }
        }, 18000);
        return;
    }

    try {
        logger.info('Creating stream with ytdl-core...');
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // 32MB
        });
        logger.info('Stream created with ytdl-core.');
        logger.info('Creating audio resource...');
        const resource = createAudioResource(stream);
        logger.info('Audio resource created:', resource);

        logger.info('Player state before playing:', serverQueue.player.state.status);
        serverQueue.player.play(resource);
        logger.info('Player state after playing:', serverQueue.player.state.status);

        serverQueue.player.on('stateChange', (oldState, newState) => {
            logger.info(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
            if (newState.status === AudioPlayerStatus.Idle) {
                serverQueue.songs.shift();
                play(client, guildId, serverQueue.songs[0], queue);
            } else if (newState.status === AudioPlayerStatus.Playing) {
                logger.info('Audio player is playing');
            } else if (newState.status === AudioPlayerStatus.Paused) {
                logger.info('Audio player is paused');
            } else if (newState.status == AudioPlayerStatus.Buffering) {
                logger.info('Audio player is buffering');
            } else if (newState.status == AudioPlayerStatus.AutoPaused) {
                logger.info('Audio player is auto paused');
            }
        });
        
        serverQueue.player.on('error', error => {
            logger.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        })

        logger.info(`Playing song: ${song.title}`);

        if (song.title && song.url && song.thumbnail && song.duration && song.request) {
            const songEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(song.title)
                .setURL(song.url)
                .setAuthor({ name: 'Now Playing 🎶' })
                .setThumbnail(song.thumbnail)
                .addFields(
                    { name: 'Duration', value: `${song.duration}`, inline: true },
                    { name: 'Request by', value: `${song.request}`, inline: true },
                )
                .setTimestamp();

            serverQueue.textChannel.send({ embeds: [songEmbed] });
        }
    } catch (error) {
        logger.error('Error in play function:', error);
        serverQueue.textChannel.send('An error occurred while trying to play the song.');
    }
}

/**
 * Print the current song queue
 * @param {Object} message - The message object
 * @param {*} queue - The song queue
 */
function printQueue(message, queue) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('There is no queue!');

    const queueEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Music Queue')
        .setAuthor({ name: 'Current Queue 🎵' })
        .setTimestamp();

    serverQueue.songs.forEach((song, index) => {
        queueEmbed.addFields({ name: `#${index + 1}: ${song.title}`, value: `Duration: ${song.duration} | Requested by: ${song.request}` });
    });

    message.channel.send({ embeds: [queueEmbed] });
}

module.exports = {
    playSong,
    pauseSong,
    resumeSong,
    skipSong,
    printQueue,
    disconnect,
};