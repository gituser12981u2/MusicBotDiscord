const { spawn } = require('child_process');
const assert = require('assert');

describe('Bot Start', function() {
    it('should start without errors',
        function(done) {
            this.timeout(10000); // 10 seconds timeout
            const bot = spawn('node', ['src/index.js']);

            let hasExited = false;

            bot.on('error', (error) => {
                if (!hasExited) {
                    hasExited = true;
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