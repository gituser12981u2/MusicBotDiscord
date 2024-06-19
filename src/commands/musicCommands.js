const { playSong, pauseSong, resumeSong, skipSong, printQueue, disconnect } = require('./musicFunctions');

// Export music command functions
module.exports = {
    playSong,
    pauseSong,
    resumeSong,
    skipSong,
    printQueue,
    disconnect,
};