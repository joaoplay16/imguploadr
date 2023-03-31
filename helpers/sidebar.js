var Stats = require("./stats"),
  Images = require("./images"),
  Comments = require("./comments")

module.exports = async function (viewModel, callback) {
  viewModel.sidebar = {
    stats: await Stats(),
    popular: await Images.popular(),
    comments: await Comments.newest(),
  }
  callback(viewModel)
}
