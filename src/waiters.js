const { spawn } = require('child_process');

const waiter = (code, options = {
    solve_on: null,
    error_on: "Error",
    process: 'Rscript'
}) => {

    return new Promise(function(resolve, reject) {
        proc = spawn(options.process, ['-e', code]);

        proc.stderr.on('data', (data) => {
            if (data.includes(options.error_on)) {
                reject(data.toString())
            }
            if (data.includes(options.solve_on)) {
                resolve({
                    proc,
                    raw_output: data
                })
            }
        });

        proc.stdout.on('data', (data) => {
            if (data.includes(options.error_on)) {
                reject(data.toString())
            }
            if (data.includes(options.solve_on)) {
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