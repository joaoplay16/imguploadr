var fs = require("fs"),
  path = require("path"),
  sidebar = require("../helpers/sidebar"),
  Models = require("../models"),
  md5 = require("md5")

module.exports = {
  index: function (req, res) {
    var viewModel = {
      image: {},
      comments: [],
    }

    return Models.Image.findOne({ filename: { $regex: req.params.image_id } })
      .exec()
      .then((image) => {
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
            .then((comments) => {
              viewModel.comments = comments

              sidebar(viewModel).then((vm) => {
                res.render("image", vm)
              })
            })
            .catch((err) => {
              throw err
            })
        } else {
          res.redirect("/")
        }
      })
      .catch((err) => {
        throw err
      })
  },
  create: function (req, res) {
    var saveImage = function () {
      var possible = "abcdefghijklmnopqrstuvwxyz0123456789",
        imgUrl = ""

      for (var i = 0; i < 6; i += 1) {
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length))
      }

      return Models.Image.find({ filename: imgUrl })
        .exec()
        .then((images) => {
          if (images.length > 0) {
            // if a matching image was found, try again (start over):
            saveImage()
          } else {
            var tempPath = req.file.path,
              ext = path.extname(req.file.originalname).toLowerCase(),
              targetPath = path.resolve("./public/upload/" + imgUrl + ext)

            if (
              ext === ".png" ||
              ext === ".jpg" ||
              ext === ".jpeg" ||
              ext === ".gif"
            ) {
              fs.rename(tempPath, targetPath, function (err) {
                console.log("EXT", ext)
                if (err) throw err
                var newImg = new Models.Image({
                  title: req.body.title,
                  filename: imgUrl + ext,
                  description: req.body.description,
                })
                newImg.save().then((image) => {
                  console.log("newImage", image)
                  res.redirect("/images/" + image.uniqueId)
                })
              })
            } else {
              fs.unlink(tempPath, function () {
                res.json(500, { error: "Only image files are allowed." })
              })
            }
          }
        })
        .catch((err) => {
          throw err
        })
    }
    return saveImage()
  },
  like: function (req, res) {
    return Models.Image.findOne({
      filename: { $regex: req.params.image_id },
    }).then((image) => {
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
  comment: function (req, res) {
    Models.Image.findOne({ filename: { $regex: req.params.image_id } }).then(
      (image) => {
        if (image) {
          var newComment = new Models.Comment(req.body)
          newComment.gravatar = md5(newComment.email)
          newComment.image_id = image._id

          newComment
            .save()
            .then((comment) => {
              res.redirect(`/images/${image.uniqueId}#${comment._id}`)
            })
            .catch((err) => {
              res.json(err)
            })
        } else {
          res.redirect("/")
        }
      }
    )
  },
  remove: function (req, res) {
    return Models.Image.findOne({ filename: { $regex: req.params.image_id } })
      .exec()
      .then((image) => {
        fs.unlink(
          path.resolve(`./public/upload/${image.filename}`),
          function (err) {
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
              .catch((err) => {
                res.json(false)
              })
          }
        )
      })
      .catch((err) => {
        throw err
      })
  },
}
