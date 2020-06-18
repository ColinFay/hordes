#' Data to JSON
#'
#' @param expr the expression to send to jsonlite::toJSON
#'
#' @return
#' @export
#' @importFrom attempt discretly
#' @importFrom jsonlite toJSON
#'
#' @examples
#' en_json(iris)
en_json <- function(expr, ...){
  discretly(toJSON)(
    force(expr), ...
  )
}
