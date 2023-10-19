import { IImage } from "../models/image"

var models = require("../models")

export type StatsType = {
  images: number
  comments: number
  views: number
  likes: number
}

module.exports = async function (): Promise<StatsType> {
  return {
    images: await models.Image.count().exec(),
    comments: await models.Comment.count().exec(),
    views: await models.Image.aggregate([
      {
        $group: {
          _id: "1",
          viewsTotal: { $sum: "$views" },
        },
      },
    ])
      .exec()
      .then((result: [{ _id: number; viewsTotal: number }]) => {
        var viewsTotal = 0
        viewsTotal += result[0]?.viewsTotal || 0

        return viewsTotal
      }),
    likes: await models.Image.aggregate([
      {
        $group: {
          _id: "1",
          likesTotal: { $sum: "$likes" },
        },
      },
    ])
      .exec()
      .then((result: [{ _id: number; likesTotal: number }]) => {
        var likesTotal = 0
        likesTotal += result[0]?.likesTotal || 0

        return likesTotal
      }),
  }
}
