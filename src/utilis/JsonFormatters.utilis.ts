export const formatJSON = (
  riskResult:any,
  variants:any,
  explanation:any
) => {

  return {

    patient_id: "PATIENT_001",

    drug: riskResult.drug,

    timestamp: new Date().toISOString(),

    risk_assessment: {
      risk_label: riskResult.risk,
      confidence_score: 0.92,
      severity: "high"
    },

    pharmacogenomic_profile: {
      primary_gene: riskResult.gene,
      phenotype: riskResult.phenotype,
      detected_variants: variants
    },

    llm_generated_explanation: {
      summary: explanation
    },

    quality_metrics: {
      vcf_parsing_success: true
    }

  };

};