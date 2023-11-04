import { Application } from "express"

var path = require("path"),
  routes = require("./routes"),
  exphbs = require("express-handlebars"),
  express = require("express"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  morgan = require("morgan"),
  methodOverride = require("method-override"),
  errorHandler = require("errorhandler"),
  moment = require("moment"),
  multer = require("multer"),
  _handlebars = require("handlebars"),
  {
    allowInsecurePrototypeAccess,
  } = require("@handlebars/allow-prototype-access")

module.exports = function (app: Application) {
  app.use(morgan("dev"))
  app.use(express.urlencoded({ extended: true }))
  // app.use(
  //   multer({ dest: path.join(__dirname, "public/upload/temp") }).single("file")
  // )
  app.use(methodOverride())
  app.use(cookieParser("some-secret-value-here"))
  const router = routes.initialize(express.Router())
  app.use("/", router)
  app.use("/public/", express.static(path.join(__dirname, "../public")))

  if ("development" === app.get("env")) {
    app.use(errorHandler())
  }

  app.engine(
    "handlebars",
    exphbs.create({
      handlebars: allowInsecurePrototypeAccess(_handlebars),
      defaultLayout: "main",
      layoutsDir: app.get("views") + "/layouts",
      partialsDir: [app.get("views") + "/partials"],
      helpers: {
        timeago: function (timestamp: number) {
          return moment(timestamp).startOf("minute").fromNow()
        },
      },
    }).engine
  )

  app.set("view engine", "handlebars")

  return app
}
