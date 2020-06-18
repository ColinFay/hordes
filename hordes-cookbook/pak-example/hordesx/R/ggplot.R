#' ggpoint
#'
#' @export
#' @import ggplot2
ggpoint <- function(n) {
  gg <- ggplot(iris[1:n, ], aes(Sepal.Length, Sepal.Width)) +
    geom_point()
  hordes::base64_img_ggplot(gg)
}
