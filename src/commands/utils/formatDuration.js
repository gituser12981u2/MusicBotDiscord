/**
 * Format a duration in seconds into a human-readable string
 * @param {number} duration - The duration in seconds
 * @returns {string} - The formatted duration string
 */
module.exports = function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration - (hours * 3600)) / 60);
    const seconds = Math.floor(duration - (hours * 3600) - (minutes * 60));

    let result = '';
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m `;
    }
    if (seconds > 0) {
        result += `${seconds}s `;
    }
    return result;
}
