import { configDotenv } from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express"
import analyzeRoute from "./router/analyze.route.js";
const app = express()
app.use(express.json());
configDotenv();


app.get("/", (req, res) => {
  res.send("API is running")
})

app.use("/api/v1", analyzeRoute);

app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message:err.message || "Internal Server Error"
  })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})