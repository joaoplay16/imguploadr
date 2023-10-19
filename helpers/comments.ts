import { Error } from "mongoose"
import { IComment } from "../models/comment"

var models = require("../models")

module.exports = {
  newest: function () {
    return models.Comment.find({}, {}, { limit: 5, sort: { timestamp: -1 } })
      .lean()
      .exec()
      .then(async (comments: IComment[]) => {
        var attachImage = function (comment: IComment) {
          return models.Image.findOne({ _id: comment.image_id })
            .exec()
            .catch((err: Error) => {
              throw err
            })
        }

        for (var i = 0; i < comments.length; i++) {
          var attachedImage = await attachImage(comments[i])
          comments[i]._image = attachedImage
        }

        return comments
      })
      .catch((err: Error) => {
        throw err
      })
  },
}
