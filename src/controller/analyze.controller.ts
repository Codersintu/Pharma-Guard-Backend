import fs from "fs";
import { parseVCF } from "../services/vc.services.js";
import { predictRisk } from "../services/riskpredictor.services.js";
import { generateExplanation } from "../services/openAi.services.js";
import { formatJSON } from "../utilis/JsonFormatters.utilis.js";

export const analyzeController = async (req: any, res: any) => {

  let filePath: string | undefined;

  try {

    // 1. Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "VCF file is required"
      });
    }

    filePath = req.file.path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file not found"
      });
    }

    // 2. Validate drugs
    if (!req.body.drugs) {
      return res.status(400).json({
        success: false,
        message: "Drugs list is required"
      });
    }

    const drugs = req.body.drugs
      .split(",")
      .map((d: string) => d.trim())
      .filter(Boolean);

    if (drugs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid drugs format"
      });
    }

    // 3. Read file
    let fileContent: string;

    try {
      fileContent = fs.readFileSync(filePath, "utf-8");
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to read VCF file"
      });
    }

    // 4. Parse VCF
    let variants;

    try {
      variants = parseVCF(fileContent);
    } catch {
      return res.status(500).json({
        success: false,
        message: "VCF parsing failed"
      });
    }

    if (!variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid variants found in VCF"
      });
    }

    // 5. Predict Risk
    let riskResult;

    try {
      riskResult = predictRisk(variants, drugs);
    } catch {
      return res.status(500).json({
        success: false,
        message: "Risk prediction failed"
      });
    }

    // 6. Generate Explanation
    let explanation: string;

    try {
      explanation = await generateExplanation(
        riskResult.gene,
        riskResult.drug,
        riskResult.phenotype
      );
    } catch {
      explanation = "Explanation could not be generated";
    }

    // 7. Create pharma JSON
    let finalJSON;

    try {
      finalJSON = formatJSON(
        riskResult,
        variants,
        explanation
      );
    } catch {
      return res.status(500).json({
        success: false,
        message: "JSON formatting failed"
      });
    }

    // 8. ✅ Transform for frontend ResultUI
    const frontendResult = {
      risk: finalJSON.risk_assessment?.risk_label || "Safe",

      confidence: Math.round(
        (finalJSON.risk_assessment?.confidence_score || 0.9) * 100
      ),

      explanation:
        finalJSON.llm_generated_explanation?.summary ||
        explanation ||
        "No explanation available",

      // optional full data for download / debugging
      raw: finalJSON
    };

    // 9. Final response
    return res.status(200).json({

      success: true,

      message: "Analysis completed successfully",

      result: frontendResult,

      // keep full pharma JSON also
      data: finalJSON

    });

  } catch (error: any) {

    console.error("Analyze Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Analysis failed",
      error: error?.message || "Unknown error"
    });

  } finally {

    // cleanup file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }

  }

};