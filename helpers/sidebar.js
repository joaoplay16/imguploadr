var Stats = require("./stats"),
  Images = require("./images"),
  Comments = require("./comments")

module.exports = async function (viewModel, callback) {
  var newestComments =  await Comments.newest()
  viewModel.sidebar = {
    stats: Stats(),
    popular: Images.popular(),
    comments: newestComments,
  }
  callback(viewModel)
}
