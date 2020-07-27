const child_process = require('child_process');
const memoization = require('fast-memoize')
const crypto = require('crypto');
const rio = require("rio");

const library_mother = (pak, capture_output = true, memoized = false) => {
    var code = `cat(paste0('"', names(loadNamespace("${pak}")),'"', collapse = ","))`
    let funs = child_process.spawnSync(
        "Rscript", ['-e',
            code
        ]
    );
    funs = JSON.parse(`[${funs.stdout.toString()}]`);
    functions_ = {};

    funs.map((fun) => {
        functions_[fun] = function(code, port = 6311) {
            if (code === undefined) {
                code = ""
            }
            code = `${pak}::${fun}(${code})`
            if (capture_output) {
                code = `capture.output(${code})`
            }
            return new Promise(function(resolve, reject) {
                rio.$e({
                    command: code,
                    port: port
                }).then((res) => {
                    resolve(res)
                }).catch((error) => {
                    reject(error)
                });
            });
        };
        if (memoized) {
            functions_[fun] = memoization(functions_[fun])
        }
    })
    return functions_
}

const library = (
    package,
    options = {
        capture_output: true
    }
) => {
    return library_mother(pak = package, capture_output = options.capture_output, memoized = false);
}

const mlibrary = (
    package, options = {
        capture_output: true
    }
) => {
    return library_mother(pak = package, capture_output = options.capture_output, memoized = true);
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