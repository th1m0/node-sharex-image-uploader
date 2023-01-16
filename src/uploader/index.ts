import express, { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import nodeCache from 'node-cache'

import ImageModel, { Image } from '../database/models/Image';

const router = express.Router();
const cache = new nodeCache({ stdTTL: 60, checkperiod: 600 })

router.route("/upload").post(multer().single("image"), async (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.header("Authentication")
  
  if (!authToken) {
    return res.status(401).json({ message: "Please specify authentication!" })
  }
  
  if (authToken != process.env.TOKEN) {
    return res.status(401).json({ message: "Authentication Failed!" })
  }

  if (!req.file) {
    return res.status(401).json({ message: "Please specify an image!" })
  }


  try {
    const image = await new ImageModel({
      data: req.file.buffer
    }).save()
    res.status(200).send(process.env.RETURN_URL! + image._id)
    cache.set(image._id.toString(), image)
  } catch (error) {
    console.error("Error saving image to database: " + error)
    next(error)
    return
  }
})

router.get("/:imageId", async (req: Request, res: Response, next: NextFunction) => {
  let { imageId } = req.params

  for (const extension of extensions) {
    if (imageId.endsWith(`.${extension}`)) {
      imageId = imageId.replace(`.${extension}`, "")
    }
  }
  
  if (cache.has(imageId)) {
    const image = cache.get(imageId) as Image
    const contentType = getContentType(image.data)

    if (contentType == null) {
      return res.status(400).json({ message: "Failed to find correct content type for this image." })
    }

    res.status(200).set("Content-Type", contentType).send(image.data)
    return
  }

  try {
    
    const image = await ImageModel.findById(imageId)

    if (image == null) {
      return res.status(404).json({ message: "Cannot find Image!" })
    }

    cache.set(image._id.toString(), image)
    const contentType = getContentType(image.data)

    if (contentType == null) {
      return res.status(400).json({ message: "Failed to find correct content type for this image." })
    }

    res.status(200).set("Content-Type", contentType).send(image.data)
  } catch (error) {
    res.status(404).json({ message: "Cannot find Image!" })
  }
})


function getContentType(data: Buffer) {

  const char = Buffer.from(data).toString("base64").charAt(0)

  switch (char) {
    case "/":
      return "image/jpeg"
    case "i":
      return "image/png"
    case "R":
      return "image/gif"
    case "U":
      return "image/webp"
    default:
      console.log("baseChar: " + char + " was not found!")
      return null
  }
}

const extensions = ["img", "jpg", "gif", "webp"]

export default router;
