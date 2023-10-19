import { Request, Response } from "express"
import { IImage } from "../models/image"
import { ViewModel } from "../helpers/sidebar"
import { Error } from "mongoose"

var sidebar = require("../helpers/sidebar"),
  ImageModel = require("../models/image")

type HomeViewModel = {
  images: IImage[]
}

module.exports = {
  index: function (req: Request, res: Response) {
    var viewModel: HomeViewModel = {
      images: [],
    }

    ImageModel.find({}, {}, { sort: { timestamp: -1 } })
      .exec()
      .then((images: IImage[]) => {
        viewModel.images = images
        sidebar(viewModel).then((vm: ViewModel) => {
          res.render("index", vm)
        })
      })
      .catch((err: Error) => {
        throw err
      })
  },
}
