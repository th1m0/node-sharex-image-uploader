import { connect, set } from "mongoose"

export default (uri: string) => {
    console.log("Connecting mongo...")
    set("strictQuery", true)
    connect(uri, err => {
        if (err) {
            console.error("MONGO STARTUP ERROR: " + err)
            return
        }
        console.log("Mongo connected!")
    })
}