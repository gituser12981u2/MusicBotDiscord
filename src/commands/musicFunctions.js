// src/commands/musicFunctions.js
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { stream, search, video_info } = require('play-dl');
const { pauseSong, resumeSong, skipSong, disconnect } = require('./controlFunctions');
const { EmbedBuilder } = require('discord.js');

async function playSong(message, urlOrSearchTerm, queue) {
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
        //console.log(songInfo)
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
            queueConstruct.connection.subscribe(queueConstruct.player);
            play(guildId, queueConstruct.songs[0], queue);
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

async function play(guildId, song, queue) {
    const serverQueue = queue.get(guildId);
    if (!song) {
        setTimeout(() => {
            if (serverQueue.songs.length === 0) {
                serverQueue.voiceChannel.leave();
                queue.delete(guildId);
            }
        }, 18000);
        return;
    }

    const streamResult = await stream(song.url, { quality: 0, format: 'opus' });
    const resource = createAudioResource(streamResult.stream, { inputType: streamResult.type });

    serverQueue.player.play(resource);

    serverQueue.player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        if (newState.status === AudioPlayerStatus.Idle) {
            serverQueue.songs.shift();
            play(guildId, serverQueue.songs[0], queue);
        }
    });

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
}

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