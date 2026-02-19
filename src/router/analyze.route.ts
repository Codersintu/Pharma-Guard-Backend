import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { analyzeController } from "../controller/analyze.controller.js";


const router = express.Router();

router.post(
  "/analyze",
  upload.single("vcfFile"),
  analyzeController
);

export default router;