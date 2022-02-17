import express, { Request, Response, NextFunction } from 'express'
import multer from 'multer'

import config from '../config'
import Image from '../database/models/Image';

const router = express.Router();

router.get('/', (req, res) => {
  
});

router.route("/upload").post(multer().single("image"), async (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.header("Authentication")
  
  if (!authToken) {
    return res.status(401).json({ message: "Please specify authentication!" })
  }
  
  if (authToken != config.token) {
    return res.status(401).json({ message: "Authentication Failed!" })
  }

  if (!req.file) {
    return res.status(401).json({ message: "Please specify an image!" })
  }


  try {
    const image = await new Image({
      data: req.file.buffer
    }).save()
    res.status(200).send(config.returnUrl + image._id)
  } catch (error) {
    console.error("Error saving image to database: " + error)
    next(error)
    return
  }
})

router.get("/:imageId", async (req: Request, res: Response, next: NextFunction) => {
  const { imageId } = req.params
  
  try {
    const image = await Image.findById(imageId)
    const baseChar = Buffer.from(image.data).toString("base64").charAt(0)
    let contentType = ""

    switch (baseChar) {
      case "/":
        contentType = "image/jpeg"
        break
      case "i":
        contentType = "image/png"
        break
      case "R":
        contentType = "image/gif"
        break
      case "U":
        contentType = "image/webp"
        break
      default:
        console.log("baseChar: " + baseChar + " was not found!")
        return res.status(400).json({ message: "Failed to find correct content type for this image." })
    }

    res.status(200).set("Content-Type", contentType).send(image.data)
  } catch (error) {
    res.status(404).json({ message: "Cannot find Image!" })
  }
})

export default router;
