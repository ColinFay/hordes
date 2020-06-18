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
path_img <- function(expr){
  x <- tempfile(fileext = ".png")
  png(filename = x)
  force(expr)
  dev.off()
  cat(x)
}

silent_requireNamespace <- attempt::without_message(requireNamespace)
silent_ggsave <- attempt::without_message(ggplot2::ggsave)
