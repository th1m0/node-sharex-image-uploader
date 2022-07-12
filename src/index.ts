import { config } from "dotenv"
config()

import app from './app'
import database from './database';

const port = process.env.PORT

//Connect mongo
database(process.env.DATABASE_URI!)

app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
