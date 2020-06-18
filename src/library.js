const child_process = require('child_process');
const memoization = require('fast-memoize')
const crypto = require('crypto');

const library_mother = (pak, hash, process = 'Rscript', memoized = false) => {
    if (hash !== null) {
        let hash_got = get_hash(pak, process)
        if (hash_got !== hash) {
            throw new Error("Hash from DESCRIPTION doesn't match specified hash.")
        }
    }
    var code = `cat(paste0('"', names(loadNamespace("${pak}")),'"', collapse = ","))`
    let funs = child_process.spawnSync(
        process, ['-e',
            code
        ]
    );
    funs = JSON.parse(`[${funs.stdout.toString()}]`);
    functions_ = {};

    funs.map((fun) => {
        functions_[fun] = function(code, options = {}) {
            if (code === undefined) {
                code = ""
            }
            return new Promise(function(resolve, reject) {
                child_process.exec(
                    `${process} --vanilla -e '${pak}::${fun}(${code})'`,
                    options,
                    (error, stdout, stderr) => {
                        if (error) {
                            reject(error)
                        }
                        if (stderr) {
                            reject(stderr)
                        }
                        resolve(stdout)
                    }
                );
            });
        };
        if (memoized) {
            functions_[fun] = memoization(functions_[fun])
        }
    })
    return functions_
}

const library = (package, hash = null, process = 'Rscript') => {
    return library_mother(pak = package, hash = hash, process, memoized = false);
}

const mlibrary = (package, hash = null, process = 'Rscript') => {
    return library_mother(pak = package, hash = hash, process, memoized = true);
}

const get_hash = (package, process = 'Rscript') => {
    let sha = crypto.createHash('sha256');
    var code = `packageDescription("${package}")`
    let desc = child_process.spawnSync(
        process, ['-e',
            code
        ]
    );
    let desc_string = desc.stdout.toString()
    sha.update(desc_string)
    return sha.digest('hex')
}

module.exports = {
    library: library,
    mlibrary: mlibrary,
    get_hash: get_hash
};