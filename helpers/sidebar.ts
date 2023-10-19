import { IComment } from "../models/comment"
import { IImage } from "../models/image"
import type { StatsType } from "./stats"

var Stats = require("./stats"),
  Images = require("./images"),
  Comments = require("./comments")

export type ViewModel = {
  image: IImage
  comments: IComment[]
  sidebar: { stats: StatsType; popular: IImage[]; comments: IComment[] }
}

module.exports = async function (viewModel: ViewModel) {
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
