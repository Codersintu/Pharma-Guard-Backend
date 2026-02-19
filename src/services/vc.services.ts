export const parseVCF = (content:any) => {

  const lines = content.split("\n");

  const variants = [];

  for (let line of lines) {

    if (line.startsWith("#")) continue;

    const cols = line.split("\t");

    const rsid = cols[2];

    const info = cols[7];

    if (!info) continue;

    const geneMatch = info.match(/GENE=([^;]+)/);

    const gene = geneMatch ? geneMatch[1] : null;

    if (gene) {

      variants.push({
        gene,
        rsid
      });

    }

  }

  return variants;

};