#' Image to base 64
#'
#' @param expr
#'
#' @return a base 64 string
#' @export
#' @rdname en_img
#' @importFrom base64enc base64encode
#'
#' @examples
#' if (interactive()){
#'
#' library(ggplot2)
#' gg <- ggplot(iris, aes(Sepal.Length, Sepal.Width)) +
#'   geom_point()
#' base64_img_ggplot(gg)
#'
#' }
base64_img <- function(expr){
  x <- tempfile(fileext = ".png")
  png(filename = x)
  force(expr)
  dev.off()
  cat(base64encode(x))
}

#' @export
#' @rdname en_img
base64_img_ggplot <- function(plot, ...){
  x <- tempfile(fileext = ".png")
  if (silent_requireNamespace("ggplot2")){
    silent_ggsave(filename = x, plot = plot, ...)
    cat(base64enc::base64encode(x))
  } else {
    stop("`en_img_ggplot()` requires {ggplot2}")
  }
}

silent_requireNamespace <- attempt::without_message(requireNamespace)
silent_ggsave <- attempt::without_message(ggplot2::ggsave)
