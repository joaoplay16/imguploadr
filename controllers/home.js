var sidebar = require("../helpers/sidebar"),
  ImageModel = require("../models").Image

module.exports = {
  index: function (req, res) {
    var viewModel = {
      images: [],
    }

    ImageModel.find({}, {}, { sort: { timestamp: -1 } })
      .exec()
      .then((images) => {
        viewModel.images = images
        sidebar(viewModel).then((vm) => {
          res.render("index", vm)
        })
      })
      .catch((err) => {
        throw err
      })
  },
}
