const fetch = require("node-fetch");
const fs = require("fs");
const Bottleneck = require("bottleneck");

const batchSize = 100;
let geneIdUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=gene&term=Homo+sapiens[Organism]&retmax=${batchSize}&retstart=`;
const geneInfoUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?retmode=json&db=gene&id=";
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 333 });

let geneNames = [];

async function getGeneNamesForBatch(batchNumber) {
  console.log(`Batch ${batchNumber}: Retrieving gene IDs...`);
  const response = await limiter.schedule(() => fetch(geneIdUrl + (batchNumber - 1) * batchSize));
  const data = await response.json();
  const batchIds = data.esearchresult.idlist;

  console.log(`Batch ${batchNumber}: Retrieving gene names...`);
  const geneInfoUrlBatch = geneInfoUrl + batchIds.join();
  const responseBatch = await limiter.schedule(() => fetch(geneInfoUrlBatch));
  const dataBatch = await responseBatch.json();

  for (const geneId in dataBatch.result) {
    const geneName = dataBatch.result[geneId].name;
    if (!geneName) continue;
    geneNames.push(geneName);
    console.log(`Retrieved gene name for gene ID ${geneId}: ${geneName}`);
  }

  console.log(`Batch ${batchNumber}: Retrieved ${batchIds.length} gene names. [${geneNames.length} total]`);
}

async function saveGeneNamesToFile() {
  const fileName = "gene-names.json";
  const data = JSON.stringify(geneNames);
  fs.writeFileSync(fileName, data);
}

async function main() {
  console.log(`Retrieving total count of gene IDs...`);
  const response = await limiter.schedule(() => fetch(geneIdUrl + "0"));
  const data = await response.json();
  const total = data.esearchresult.count;
  const numBatches = Math.ceil(total / batchSize);

  console.log(`Retrieved total count of ${total} gene IDs. Starting retrieval of gene names...`);

  for (let batchNumber = 1; batchNumber <= numBatches; batchNumber++) {
    await getGeneNamesForBatch(batchNumber);
    await saveGeneNamesToFile();

    if (batchNumber < numBatches) {
      console.log(`Waiting before next batch...`);
      await limiter.schedule(() => {});
    }
  }

  console.log(`Retrieved ${geneNames.length} gene names in total.`);
}

main().catch(error => console.error(error));
