
library(plumber)
library(ggplot2)
library(hordesx)

#* @apiTitle Plumber Example API

#* Echo back the input
#* @param n The message to echo
#* @get /iris
function(n) {
  gg <- ggplot(iris[1:n, ], aes(Sepal.Length, Sepal.Width)) +
    geom_point()
  capture.output(hordes::base64_img_ggplot(gg))
}

