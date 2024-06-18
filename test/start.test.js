const { exec } = require('child_process');
const assert = require('assert');

describe('Bot Start', function() {
    it('should start without errors',
        function(done) {
            this.timeout(10000); // 10 seconds timeout
            const bot = exec('node src/index.js', (error, stdout, stderr) => {
                if (error && error.signal !== 'SIGINT') {
                    done(error);
                }
            });

            setTimeout(() => {
                bot.kill('SIGINT');
                done();
            }, 5000) // Run the bot for 5 seconds
        }
    );
});