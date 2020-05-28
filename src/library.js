const child_process = require('child_process');
const memoization = require('fast-memoize')
const crypto = require('crypto');

const library_mother = (pak, process = 'Rscript', memoized = false) => {
    var code = `cat(paste0('"', names(loadNamespace("${pak}")),'"', collapse = ","))`
    let funs = child_process.spawnSync(
        process, 
        ['-e', 
            code
        ]
    );
    funs =  JSON.parse(`[${funs.stdout.toString()}]`);
    functions_ = {};

    funs.map((fun) => {
        functions_[fun] = function(code, options = {}){

            return new Promise(function (resolve, reject) {
                child_process.exec(
                    `${process} --vanilla -e '${pak}::${fun}(${code})'`, 
                    options,
                    (error, stdout, stderr) => {
                        if (error) {
                            reject(error)
                          }
                        if (stderr){
                            reject(stderr)
                        }
                        resolve(stdout)
                    }
            );
            });
        };
        if (memoized){
            functions_[fun] = memoization(functions_[fun])
        }
    })
    return functions_
}

const library = (pak, process = 'Rscript') => {
    return library_mother(pak, process, memoized = false);
}

const mlibrary = (pak, process = 'Rscript') => {
    return library_mother(pak, process, memoized = true);
}

module.exports = {
    library: library,
    mlibrary: mlibrary,
};