const { spawn } = require('child_process');

const waiter = (code, solve_on, error_on = "Error") => {

    return new Promise(function(resolve, reject) {
        proc = spawn('Rscript', ['-e', code]);

        proc.stderr.on('data', (data) => {
            if (data.includes(error_on)) {
                reject(data.toString())
            }
            if (data.includes(solve_on)) {
                resolve({
                    proc,
                    raw_output: data
                })
            }
        });

        proc.stdout.on('data', (data) => {
            if (data.includes(error_on)) {
                reject(data.toString())
            }
            if (data.includes(solve_on)) {
                resolve({
                    proc,
                    raw_output: data
                })
            }
        });
    })
}

module.exports = {
    waiter: waiter
};