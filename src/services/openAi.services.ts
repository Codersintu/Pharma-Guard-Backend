import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export const generateExplanation = async (
  gene:any,
  drug:any,
  phenotype:any
) => {

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
Explain in clinical terms why gene ${gene} with phenotype ${phenotype}
affects drug ${drug} metabolism.

Include:
- biological mechanism
- clinical risk
- dosing recommendation
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return response;

  }
  catch (error) {

    console.error(error);

    return "Explanation unavailable";

  }

};