import { configDotenv } from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express"
import analyzeRoute from "./router/analyze.route.js";
import cors from "cors";
const app = express()
app.use(express.json());
configDotenv();

app.use(cors({
  origin: "http://localhost:3000",
}))

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

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}
export default app;