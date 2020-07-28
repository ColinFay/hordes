#!/usr/bin/env Rscript --vanilla
(function(){
    dir.create("rtemplib")
    on.exit(unlink("rtemplib", TRUE, TRUE))

    if (!requireNamespace("remotes", quietly = TRUE)){
        install.packages("remotes", lib = "rtemplib", repos = "https://cloud.r-project.org/")
        library(remotes, lib.loc = "rtemplib")
    } else {
        library(remotes)
    }

    install_github("colinfay/hordes", subdir = "r-hordes")
    install_cran("Rserve", repos = "https://cloud.r-project.org/")

})()