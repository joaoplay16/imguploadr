var Stats = require("./stats"),
  Images = require("./images"),
  Comments = require("./comments")

module.exports = async function (viewModel) {
  const [stats, popular, comments] = await Promise.all([
    Stats(),
    Images.popular(),
    Comments.newest(),
  ])

  viewModel.sidebar = {
    stats,
    popular,
    comments,
  }

  return Promise.resolve(viewModel)
}
