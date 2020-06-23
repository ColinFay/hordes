function(){
    if (!requireNamespace("remotes",quietly = TRUE)){
        dir.create("rtemplib")
        install.packages("remotes", lib = "rtemplib", repos = "https://cloud.r-project.org/")
        on.exit(unlink("rtemplib", TRUE))
    }
    library(remotes, lib.loc = "rtemplib")
    install_local("r-hordes")
}()