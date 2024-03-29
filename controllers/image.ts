import { Request, Response } from "express"
import { IImage } from "../models/image"
import { IComment } from "../models/comment"
import { Error } from "mongoose"
import { ViewModel } from "../helpers/sidebar"
import { MulterRequest } from "../types/express/index.types"

import fs = require("node:fs/promises")
import path = require("path")
const sidebar = require("../helpers/sidebar")
const Models = require("../models")
const md5 = require("md5")
import multer = require("multer")

const upload = multer({
  dest: path.resolve("./public/upload/temp"),
  limits: {
    fileSize: 1024 * 1024,
  },
}).single("file")

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
          res.status(404).send("<h2>Error 404: Image not found</h2>")
        }
      })
      .catch((err: Error) => {
        throw err
      })
  },
  create: function (req: Request, res: Response): Promise<any> {
    const multerRequest = req as MulterRequest
    if (multerRequest.file === undefined){
      let errorMessage = "400 Bad Request. Please select a file to upload."
      res.status(400).send(errorMessage)
      return Promise.reject(errorMessage)
    }
    function saveImage() {
      var possible = "abcdefghijklmnopqrstuvwxyz0123456789",
        imgUrl = ""

      for (var i = 0; i < 6; i += 1) {
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length))
      }

      Models.Image.find({ filename: imgUrl })
        .exec()
        .then((images: IImage[]) => {
          if (images.length > 0) {
            // if a matching image was found, try again (start over):
            saveImage()
          } else {
            var tempPath = multerRequest.file.path,
              ext = path.extname(multerRequest.file.originalname).toLowerCase(),
              targetPath = path.resolve("./public/upload/" + imgUrl + ext)

            if (
              ext === ".png" ||
              ext === ".jpg" ||
              ext === ".jpeg" ||
              ext === ".gif" ||
              ext === ".webp"
            ) {
              fs.rename(tempPath, targetPath).then(function () {
                // if (err) throw err
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
              fs.unlink(tempPath).then(function () {
                res.status(415).json({ error: "Only image files are allowed." })
              })
            }
          }
        })
        .catch((err: Error) => {
          throw err
        })
    }

    return new Promise<void>((resolve, reject) => {
      upload(req, res, function (error) {
        if (error) {
          reject(error)
          return
        }
        // Everything went fine.
        saveImage()
        resolve()
      })
    }).catch((error) => {
      if (error instanceof multer.MulterError) {
        res
          .status(413)
          .send(`<h2>File is too large to upload. Max file size is 1mb</h2>`)
      } else if (error) {
        res.status(500).send("An unknown error occurred when uploading.")
      }
    })
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
          fs.access(path.resolve(`./public/upload/${image.filename}`))
            .then(function () {
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
            })
            .catch((error: Error) => {
              res.status(404).send(`
                <h2>Was not possible comment the image. No such file or directory.</h2>
            `)
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
        return Models.Comment.deleteMany({ image_id: image._id })
          .exec()
          .then(() => {
            image.deleteOne().then(() => {
              res.json(true)
            })
          })
          .catch(() => {
            res.json(false)
          })
          .finally(() => {
            return fs.unlink(path.resolve(`./public/upload/${image.filename}`))
          })
      })
      .catch((err: Error) => {
        console.log("Error when removing the image")
      })
  },
}
