import { Application } from "express"
var express = require("express"),
  config = require("./server/configure"),
  mongoose = require("mongoose"),
  app: Application = express()
app.set("port", process.env.PORT || 3300)
app.set("views", __dirname + "/views")
app = config(app)

mongoose.connect("mongodb://localhost/imgPloadr")
mongoose.connection.on("open", function () {
  console.log("Mongoose connected.")
})

app.listen(app.get("port"), function () {
  console.log("Server up: http://localhost:" + app.get("port"))
})
