import { connect } from "mongoose"

export default (uri: string) => {
    console.log("Connecting mongo...")
    connect(uri, err => {
        if (err) {
            console.error("MONGO STARTUP ERROR: " + err)
            return
        }
        console.log("Mongo connected!")
    })
}