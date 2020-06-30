const child_process = require('child_process');
const memoization = require('fast-memoize')
const crypto = require('crypto');

const library_mother = (pak, process = 'Rscript', memoized = false) => {
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

const library = (package, process = 'Rscript') => {
    return library_mother(pak = package, hash = hash, process, memoized = false);
}

const mlibrary = (package, process = 'Rscript') => {
    return library_mother(pak = package, process, memoized = true);
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

const check_hash = (package, hash, process = 'Rscript') => {
    let hash_got = get_hash(package, process)
    if (hash_got !== hash) {
        throw new Error("Hash from DESCRIPTION doesn't match specified hash.")
    }
}

module.exports = {
    library: library,
    mlibrary: mlibrary,
    get_hash: get_hash,
    check_hash: check_hash
};