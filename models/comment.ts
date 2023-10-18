import mongoose, { Document, Schema } from "mongoose"
import { IImage } from "./image"

export interface IComment extends Document {
  image_id: Schema.Types.ObjectId
  email: string
  name: string
  gravatar: string
  comment: string
  timestamp: Date
  _image?: IImage
}

const CommentSchema = new Schema<IComment>({
  image_id: { type: Schema.Types.ObjectId },
  email: { type: String },
  name: { type: String },
  gravatar: { type: String },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now },
})

CommentSchema.virtual("image")
  .set(function (this: IComment, image: IImage) {
    this._image = image
  })
  .get(function (this: IComment) {
    return this._image
  })

module.exports = mongoose.model<IComment>("Comment", CommentSchema)
