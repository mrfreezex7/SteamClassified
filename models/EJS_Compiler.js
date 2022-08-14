const fs = require('fs'),
    ejs = require("ejs");

const OptionDetails = require('../utility/TF2/OptionDetails');
const { log } = require('../models/Logger');

class EJS_Compiler {

    static FilesToCompile = [{
        compilableFilePath: __dirname + '/../views/compilable_includes/tf2-item-options.ejs',
        options: { OptionDetails: OptionDetails.getTF2Options() },
        compliledResultPath: __dirname + '/../views/includes/tf2-item-options',
    }];

    static CompileAllFilesToHtml(FilesToCompile) {

        return new Promise((resolve, reject) => {

            fs.readFile(FilesToCompile.compilableFilePath, 'utf8', function (err, data) {
                if (err) { log.info(err); return false; }
                var ejs_string = data,
                    template = ejs.compile(ejs_string),
                    html = template(FilesToCompile.options);
                fs.writeFile(FilesToCompile.compliledResultPath + '.ejs', html, function (err) {
                    if (err) { log.info(err); return false }
                    return true;
                });
            });

        })

    }

}

EJS_Compiler.CompileAllFilesToHtml(EJS_Compiler.FilesToCompile[0]);

module.exports = EJS_Compiler;