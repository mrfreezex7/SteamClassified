const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: "production", level: 'info' });


module.exports = {
    log: log,
}