const child_process = require('child_process');

const install_rserve = function() {
    child_process.spawnSync(
        "Rscript", ["-e", "install.packages('Rserve', repo = 'http://rforge.net')"]
    )
}

const hordes_init = (port = 6311) => {

    // child_process.spawnSync('R', ['CMD', 'Rserve', '--vanilla', '--RS-port', port])
    // return child_process.execSync(`R CMD Rserve --vanilla --RS-port ${port}`)

    return new Promise(function(resolve, reject) {
        proc = child_process.spawn('R', ['CMD', 'Rserve', '--vanilla', '--RS-port', port]);

        proc.on('close', (code) => {
            resolve()
        });

        proc.on('exit', (code) => {
            resolve()
        });
    })
}

module.exports = {
    hordes_init: hordes_init,
    install_rserve: install_rserve
};