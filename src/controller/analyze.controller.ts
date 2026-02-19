import fs from "fs";
import { parseVCF } from "../services/vc.services.js";
import { predictRisk } from "../services/riskpredictor.services.js";
import { generateExplanation } from "../services/openAi.services.js";
import { formatJSON } from "../utilis/JsonFormatters.utilis.js";

export const analyzeController = async (req: any, res: any) => {

  let filePath: string | undefined;

  try {


    if (!req.file) {
      return res.status(400).json({
        message: "VCF file is required"
      });
    }

    filePath = req.file.path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({
        message: "Uploaded file not found"
      });
    }

    if (!req.body.drugs) {
      return res.status(400).json({
        message: "Drugs list is required"
      });
    }

    const drugs = req.body.drugs
      .split(",")
      .map((d: string) => d.trim())
      .filter(Boolean);

    if (drugs.length === 0) {
      return res.status(400).json({
        message: "Invalid drugs format"
      });
    }


  
    let fileContent: string;

    try {
      if (!filePath) {
        return res.status(400).json({
          message: "File path is missing"
        });
      }
      fileContent = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      return res.status(500).json({
        message: "Failed to read VCF file"
      });
    }


    let variants;

    try {
      variants = parseVCF(fileContent);
    } catch (err) {
      return res.status(500).json({
        message: "VCF parsing failed"
      });
    }

    if (!variants || variants.length === 0) {
      return res.status(400).json({
        message: "No valid variants found in VCF"
      });
    }


    let riskResult;

    try {
      riskResult = predictRisk(variants, drugs);
    } catch (err) {
      return res.status(500).json({
        message: "Risk prediction failed"
      });
    }


   
    let explanation;

    try {
      explanation = await generateExplanation(
        riskResult.gene,
        riskResult.drug,
        riskResult.phenotype
      );
    } catch (err) {
      explanation = "Explanation could not be generated";
    }


 
    let finalJSON;

    try {
      finalJSON = formatJSON(
        riskResult,
        variants,
        explanation
      );
    } catch (err) {
      return res.status(500).json({
        message: "JSON formatting failed"
      });
    }


  
    return res.status(200).json({
      message: "Analysis completed successfully",
      data: finalJSON
    });


  } catch (error: any) {

    console.error("Analyze Controller Error:", error);

    return res.status(500).json({
      message: "Analysis failed",
      error: error?.message || "Unknown error"
    });

  } finally {

  
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("File cleanup failed:", err);
      });
    }

  }

};