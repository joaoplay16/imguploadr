import mongoose, { Schema, Document } from "mongoose"
import path from "path"

export interface IImage extends Document {
  title: string
  description: string
  filename: string
  views: number
  likes: number
  timestamp: Date
  uniqueId: string
}

const ImageSchema = new Schema<IImage>({
  title: { type: String },
  description: { type: String },
  filename: { type: String },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
})

ImageSchema.virtual("uniqueId").get(function (this: IImage) {
  return this.filename.replace(path.extname(this.filename), "")
})

module.exports = mongoose.model("Image", ImageSchema)
