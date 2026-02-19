export const predictRisk = (variants:any, drugs:any) => {

  let result = {
    gene: "Unknown",
    drug: drugs[0],
    phenotype: "Unknown",
    risk: "Safe"
  };

  for (let variant of variants) {

    if (
      variant.gene === "CYP2C19" &&
      drugs.includes("CLOPIDOGREL")
    ) {

      result = {
        gene: "CYP2C19",
        drug: "CLOPIDOGREL",
        phenotype: "Poor Metabolizer",
        risk: "Ineffective"
      };

    }

  }

  return result;

};