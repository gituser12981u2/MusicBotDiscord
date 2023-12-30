# MusicBotDiscord

## Overview
MusicBotDiscord is a versatile and user-friendly Discord bot designed to enhance the music listening experience within Discord servers. It allows users to play, control, and enjoy music directly from Discord channels with ease and efficiency.

## Features
- **Music Playback**: Play music from various sources directly in your Discord server.
- **Control Functions**: Includes commands to play, pause, skip, and manage the music queue.
- **Music Commands**: Easy-to-use commands for seamless music control.
- **Duration Formatting**: Utility to format the duration of tracks.

## Getting Started

### Prerequisites
- Node.js (latest version recommended)
- A Discord Bot Token ([Guide to creating a Discord Bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/gituser12981u2/MusicBotDiscord.git
   cd MusicBotDiscord

2. Install dependencies
   npm install

### Configuration
- Create a .env file in the root directory and add your Discord Bot Token:
  DISCORD_BOT_TOKEN=your_discord_bot_token_here

### Running the Bot
- Start the bot using Node.js:
  node src/index.js

## Commands
    !play <url_or_search_term>: Play music from a URL or search for a track.
    !pause: Pause the current track.
    !resume: Resume playback.
    !skip: Skip to the next track in the queue.
    !stop: Stop playback and clear the queue.

## Contributing
Contributions to MusicBotDiscord are welcome. If you have suggestions or improvements, feel free to fork the repository and submit a pull request.
