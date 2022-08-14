const config = require('../config/keys');
const Firebase = require('../utility/firebase-db');
const { log } = require('./Logger');

class Maintenance {


    static setMode(value = true, callback) {
        return new Promise((resolve, reject) => {
            Firebase.getDb().collection('Settings').doc('MaintenanceMode').set({ isMaintenanceMode: value }).then(() => {
                config.maintenance.current = value;
                resolve(config.maintenance.current);
            }).catch(err => { log.info(err); reject(config.maintenance.current) });
        })

    }

    static getUpdatedMode(callback) {
        return Firebase.getDb().collection('Settings').doc('MaintenanceMode').get().then((doc) => {
            if (!doc.exists) {
                log.info('no doc exists maintenance');
            } else {
                let data = doc.data();
                config.maintenance.current = data.isMaintenanceMode;
                log.info('Maintenance Mode : ' + config.maintenance.current);
                callback(null);
            }
        }).catch(err => { log.info(err); callback(config.maintenance.current); });
    }

}

module.exports = Maintenance;