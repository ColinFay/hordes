# hordes 0.1.3

+ `library` no longer has a hash parameter. To check that the hash of a package hasn't changed, now use the `get_hash()` function. 
+ The `package` argument function is now consistently called `package` in all functions (used to be `pak`)
+ There is now a script that allows you to install the `{hordes}` R package that comes with `hordes` (`cd node_modules/hordes/ && npm run r-hordes-install`). You can also install it from R with `remotes::install_github("colinfay/hordes", subdir = "r-hordes")`

# hordes 0.1.2

First stable version 