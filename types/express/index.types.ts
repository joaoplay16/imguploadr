import { Request } from "express"

interface MulterRequest extends Request {
  file: any
}

export { MulterRequest }
