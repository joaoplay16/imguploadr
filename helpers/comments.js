var models = require("../models")

module.exports = {
  newest: function () {
    return models.Comment.find({}, {}, { limit: 5, sort: { timestamp: -1 } })
    .lean()  
    .exec()
      .then(async (comments) => {
        var attachImage = function (comment) {
          return models.Image.findOne({ _id: comment.image_id })
            .exec()
            .catch((err) => {
              throw err
            })
        }

        for (var i = 0; i < comments.length; i++) {
          var attachedImage = await attachImage(comments[i])
          comments[i].image = attachedImage
        }

        return comments
      })
      .catch((err) => {
        throw err
      })
  },
}
