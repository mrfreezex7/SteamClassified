const mongoose = require('mongoose');

const config = require('../config/keys');
const { log } = require('../models/Logger');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}

exports.Connect = function () {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.mongodb.dbURI, options).then(() => {
            log.info('Connected successfully to Database');
            resolve();
        }).catch(err => {
            reject(err);
        })
    })
}
