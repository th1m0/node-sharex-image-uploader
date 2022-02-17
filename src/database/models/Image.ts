import { ObjectId } from 'bson'
import { Schema, model } from 'mongoose'

export interface Image {
    _id: ObjectId
    data: Buffer,
    createdAt: Date
    updatedAt: Date
}

const ImageModel = new Schema<Image>({
    data: {
        type: Buffer,
        required: true
    }
}, {
    timestamps: true
})

export default model("Images", ImageModel)