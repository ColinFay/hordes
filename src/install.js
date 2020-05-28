const child_process = require('child_process');

const check_remotes = (epo) => {
    code = `if (!requireNamespace("remotes") install.packages("remotes", repos = "${repo}")`
    console.log(code)
    child_process.spawnSync(
        'Rscript', 
        [
            '-e', 
            code
        ]
    );
}

const install_local = (pak, repo = 'https://cran.rstudio.com/') => {
    check_remotes(repo)
    code = `remotes::install_local("${pak}", repos = "${repo}")`
    child_process.spawnSync(
        'Rscript', 
        [
            '--vanilla',
            '-e', 
            code
        ]
    );
}
module.exports  = {
    install_local
};