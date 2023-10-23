import { Request, Response } from "express"
import { IImage } from "../models/image"
import { IComment } from "../models/comment"
import { Error } from "mongoose"
import { ViewModel } from "../helpers/sidebar"
import { MulterRequest } from "../types/express/index.types"

var fs = require("fs"),
  path = require("path"),
  sidebar = require("../helpers/sidebar"),
  Models = require("../models"),
  md5 = require("md5")

module.exports = {
  index: function (req: Request, res: Response): Promise<any> {
    var viewModel: ViewModel = {
      image: {} as IImage,
      comments: [],
      sidebar: {
        stats: {
          images: 0,
          comments: 0,
          views: 0,
          likes: 0,
        },
        popular: [],
        comments: [],
      },
    }

    return Models.Image.findOne({ filename: { $regex: req.params.image_id } })
      .exec()
      .then((image: IImage) => {
        if (image) {
          image.views = image.views + 1
          viewModel.image = image
          image.save()

          Models.Comment.find(
            { image_id: image._id },
            {},
            {
              sort: {
                timestamp: 1,
              },
            }
          )
            .exec()
            .then((comments: IComment[]) => {
              viewModel.comments = comments

              sidebar(viewModel).then((vm: ViewModel) => {
                res.render("image", vm)
              })
            })
            .catch((err: Error) => {
              throw err
            })
        } else {
          res.redirect("/")
        }
      })
      .catch((err: Error) => {
        throw err
      })
  },
  create: function (req: Request, res: Response): Promise<any> {
    var saveImage = function () {
      var possible = "abcdefghijklmnopqrstuvwxyz0123456789",
        imgUrl = ""

      for (var i = 0; i < 6; i += 1) {
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length))
      }

      return Models.Image.find({ filename: imgUrl })
        .exec()
        .then((images: IImage[]) => {
          if (images.length > 0) {
            // if a matching image was found, try again (start over):
            saveImage()
          } else {
            const multerRequest = req as MulterRequest
            var tempPath = multerRequest.file.path,
              ext = path.extname(multerRequest.file.originalname).toLowerCase(),
              targetPath = path.resolve("./public/upload/" + imgUrl + ext)

            if (
              ext === ".png" ||
              ext === ".jpg" ||
              ext === ".jpeg" ||
              ext === ".gif"
            ) {
              fs.rename(tempPath, targetPath, function (err: unknown) {
                console.log("EXT", ext)
                if (err) throw err
                var newImg = new Models.Image({
                  title: req.body.title,
                  filename: imgUrl + ext,
                  description: req.body.description,
                })
                newImg.save().then((image: IImage) => {
                  console.log("newImage", image)
                  res.redirect("/images/" + image.uniqueId)
                })
              })
            } else {
              fs.unlink(tempPath, function () {
                res.status(500).json({ error: "Only image files are allowed." })
              })
            }
          }
        })
        .catch((err: Error) => {
          throw err
        })
    }
    return saveImage()
  },
  like: function (req: Request, res: Response): Promise<any> {
    return Models.Image.findOne({
      filename: { $regex: req.params.image_id },
    }).then((image: IImage) => {
      if (image) {
        image.likes = image.likes + 1
        image
          .save()
          .then(() => {
            res.json({ likes: image.likes })
          })
          .catch((err) => {
            res.json(err)
          })
      }
    })
  },
  comment: function (req: Request, res: Response) {
    Models.Image.findOne({ filename: { $regex: req.params.image_id } }).then(
      (image: IImage) => {
        if (image) {
          var newComment = new Models.Comment(req.body)
          newComment.gravatar = md5(newComment.email)
          newComment.image_id = image._id

          newComment
            .save()
            .then((comment: IComment) => {
              res.redirect(`/images/${image.uniqueId}#${comment._id}`)
            })
            .catch((err: Error) => {
              res.json(err)
            })
        } else {
          res.redirect("/")
        }
      }
    )
  },
  remove: function (req: Request, res: Response): Promise<any> {
    return Models.Image.findOne({ filename: { $regex: req.params.image_id } })
      .exec()
      .then((image: IImage) => {
        fs.unlink(
          path.resolve(`./public/upload/${image.filename}`),
          function (err: Error) {
            if (err) {
              throw err
            }

            Models.Comment.deleteMany({ image_id: image._id })
              .exec()
              .then(() => {
                image.deleteOne().then(() => {
                  res.json(true)
                })
              })
              .catch((err: Error) => {
                res.json(false)
              })
          }
        )
      })
      .catch((err: Error) => {
        throw err
      })
  },
}
