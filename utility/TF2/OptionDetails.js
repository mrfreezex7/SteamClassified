const TF2UnusualParticlesData = require('../../ItemsDB/TF2/TF2UnusualParticlesData.json');
const TF2PaintsData = require('../../ItemsDB/TF2/TF2PaintsData.json');
const TF2StrangePartsData = require('../../ItemsDB/TF2/TF2StrangePartsData.json');
const { log } = require('../../models/Logger');

class OptionDetails {
    static TF2Options = null;
    static CSGOOptions = null;
    static DOTA2Options = null;

    static getTF2Options() {
        log.info('ran-tf2-options');
        if (!this.TF2Options) {
            let effectNames = [];
            let paintNames = [];
            let partNames = [];
            for (const key in TF2UnusualParticlesData.data) {
                if (Object.hasOwnProperty.call(TF2UnusualParticlesData.data, key)) {
                    effectNames.push(key);
                }
            }
            for (const key in TF2PaintsData) {
                if (Object.hasOwnProperty.call(TF2PaintsData, key)) {
                    paintNames.push(key);
                }
            }
            for (const key in TF2StrangePartsData) {
                if (Object.hasOwnProperty.call(TF2StrangePartsData, key)) {
                    partNames.push(key);
                }
            }
            this.TF2Options = {
                effectNames: effectNames,
                paintNames: paintNames,
                partNames: partNames,
            }
            return this.TF2Options;
        }
        return this.TF2Options;
    }
}

module.exports = OptionDetails;