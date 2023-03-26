var fs = require("fs"),
  path = require("path"),
  sidebar = require("../helpers/sidebar"),
  Models = require("../models")

module.exports = {
  index: function (req, res) {
    var viewModel = {
      image: {},
      comments: [],
    }

    Models.Image.findOne({ filename: { $regex: req.params.image_id } })
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

              sidebar(viewModel, function (viewModel) {
                res.render("image", viewModel)
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

      Models.Image.find({ filename: imgUrl })
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
                if (err) throw err
                var newImg = new Models.Image({
                  title: req.body.title,
                  filename: imgUrl + ext,
                  description: req.body.description,
                })
                newImg.save().then(image => {
                  console.log("IMAGE RETRIEVED", image);
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
    saveImage()
  },
  like: function (req, res) {
    res.json({ likes: 1 })
  },
  comment: function (req, res) {
    res.send("The image:comment POST controller")
  },
}
