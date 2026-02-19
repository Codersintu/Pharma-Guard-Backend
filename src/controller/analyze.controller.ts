import fs from "fs";
import { parseVCF } from "../services/vc.services.js";
import { predictRisk } from "../services/riskpredictor.services.js";
import { generateExplanation } from "../services/openAi.services.js";
import { formatJSON } from "../utilis/JsonFormatters.utilis.js";


export const analyzeController = async (req:any, res:any) => {

  try {

    const filePath = req.file.path;

    const drugs = req.body.drugs.split(",");

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const variants = parseVCF(fileContent);


    const riskResult = predictRisk(variants, drugs);

    const explanation = await generateExplanation(
      riskResult.gene,
      riskResult.drug,
      riskResult.phenotype
    );

    // Step 5: format JSON
    const finalJSON = formatJSON(
      riskResult,
      variants,
      explanation
    );

    res.json(finalJSON);

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Analysis failed"
    });

  }

};