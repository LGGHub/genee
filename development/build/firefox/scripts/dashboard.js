const TERMS = {
  'loss': [
    'deletion'
  , 'microdeletion'
  , 'loss '
  , 'partial monosomy'
  ]
, 'gain': [
    'duplication'
  , 'microduplication'
  , 'gain'
  , 'partial trisomy'
  ]  
, 'loss-full': [
    'deletion'
  , 'del'
  , 'loss'
  , 'loss cnv'
  , 'cnv'
  , 'copy loss'
  , 'microdeletion'
  , 'microdel'
  , 'partial monosomy'
  , 'monsomy'
  , 'haploinsufficiency'
  ]
, 'gain-full': [
    "duplication"
  , "dup"
  , "triplication"
  , "trip"
  , "amplification"
  , "gain"
  , "gain cnv"
  , "cnv"
  , "copy gain"
  , "microduplication"
  , "microdup"
  ]
}

function setTerms(label) {
  if (!TERMS[label]) return;
  $('#additional-terms').val(TERMS[label].join('\n'));
}

function splitArrayByLengthAndWords(array, maxWords, maxLength, joinDelimiter) {
  let output = [];
  let currentArray = [];
  let currentLength = 0;
  let currentString = '';
  for (let i = 0; i < array.length; i++) {
    const currentElement = array[i];
    const elementLength = currentElement.length + joinDelimiter.length;
    const wordCount = (currentString + (currentString ? joinDelimiter : '') + currentElement).split(/[\W\s]+/).length;

    if (currentLength + elementLength > maxLength || wordCount > maxWords) {
      output.push(currentArray);
      currentArray = [];
      currentLength = 0;
      currentString = '';
    }
    currentArray.push(currentElement);
    currentLength += elementLength;
    currentString = currentArray.join(joinDelimiter);
  }
  if (currentArray.length > 0) {
    output.push(currentArray);
  }
  return output;
}

function getCytobandPairs(cytobands) {
  // Sort the cytobands by number
  cytobands.sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, ''));
    const bNum = parseInt(b.replace(/\D/g, ''));
    return aNum - bNum;
  });

  // Generate the pairs
  const pairs = [];
  for (let i = 0; i < cytobands.length; i++) {
    for (let j = i + 1; j < cytobands.length; j++) {
      pairs.push([cytobands[i], cytobands[j]]);
    }
  }

  return pairs;
}

function parseChromosomeCoordinates(coordString) {
  // Define regular expressions to match different input formats
  const regexes = [
    /^\s*[a-z]*(\d+)\W+([\d,]+)\W+([\d,]+)\s*$/i,
    /^\s*[a-z]*(\d+)\W+([\d,]+)\W+([\d,]+)\s*$/i,
    /^\s*(\d+)\W*([\d,]+)\W+([\d,]+)\s*$/i,
    /^\s*(\d+)\W*([\d,]+)\W*([\d,]+)$\s*/i,
  ];

  // Try each regular expression in turn to see if it matches the input string
  for (let i = 0; i < regexes.length; i++) {
    const match = coordString.match(regexes[i]);
    if (match) {
      // Extract the chromosome number, start, and end coordinates
      const chrNum = parseInt(match[1].replace(/\D/g, ''));
      const start = parseInt(match[2].replace(/\D/g, ''));
      const end = parseInt(match[3].replace(/\D/g, ''));

      // Determine the build, if applicable (default to "GRCh38")
      // let build = "hg38";
      // if (match[4]) {
      //   build = convertToHG(match[4]);
      // }

      // Return the parsed coordinates as an object
      // return { chrNum, start, end, build };
      return { chrNum, start, end };
    }
  }

  // If none of the regular expressions match, return null
  return null;
}

function parseISCNCoordinates(coordString) {
  // Define a regular expression to match ISCN format notation
  const regex = /^arr\[(\w+)\]\s+(\d+|X|Y|MT)(q|p)(\d+\.\d+)(q|p)(\d+\.\d+)\((\d+)_(\d+)\)x(\d+)$/;

  // Try to match the regular expression against the input string
  const match = coordString.match(regex);
  if (!match) {
    // If the regular expression does not match, return null
    return null;
  }

  // Extract the build, chromosome number, start, end, and copy number
  const build = convertToHG(match[1]);
  let chrNum = match[2];
  const start = parseInt(match[7]);
  const end = parseInt(match[8]);
  const copyNumber = parseInt(match[9]);

  // Convert chromosome number "X", "Y", and "MT" to integers
  if (chrNum === "X") {
    chrNum = 23;
  } else if (chrNum === "Y") {
    chrNum = 24;
  } else if (chrNum === "MT") {
    chrNum = 25;
  } else {
    chrNum = parseInt(chrNum);
  }

  // Return the parsed coordinates as an object
  return { chrNum, start, end, build, copyNumber };
}

function convertToHG(buildName) {
  // Define a lookup table for genome build names
  const buildTable = {
    grch37: "hg19",
    grch38: "hg38",
    grch39: "hg19",
    ncbi36: "hg18",
    'ncbi36.1': "hg18"
  };

  // Look up the HG equivalent for the specified build name
  const hgName = buildTable[buildName.toLowerCase()];
  if (!hgName) {
    // If the specified build name is not in the table, return null
    return buildName;
  }

  // Return the HG equivalent
  return hgName;
}

async function getCytobandNames(build, chrom, start, end) {
  try {
    const url = `https://api.genome.ucsc.edu/getData/track?track=cytoBand&genome=${build}&chrom=chr${chrom}&start=${start}&end=${end}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const cytoBands = data.cytoBand;
    const cytoBandNames = cytoBands.map((band) => band.name);
    return cytoBandNames;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function cytobandLookup(opt) {
  let chr = $('#chromosome').val()
    , start = $('#start-coord').val()
    , end = $('#end-coord').val()
    , build = $('#genome-build').val();

  if (!chr || !start || !end || !build) {
    return
  }

  let cytobands = await getCytobandNames(build, chr, start, end)
    , format = $('[name="terms-format"]:checked').val();

  if (opt === 'cytoband-pairs') cytobands = getCytobandPairs(cytobands).map(p => p.join(''));
  else if (opt === 'cytoband-all') cytobands = cytobands.concat(getCytobandPairs(cytobands).map(p => p.join('')));

  cytobands = cytobands.map(c => `${chr}${c}`);

  fillTextArea('terms', cytobands);
  renderLinksTable();
}

function buildGoogleScholarQueries(terms, max_query_length = 30) {
  let queries = [];
  let currentQuery = '';
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const termLength = term.length + 4; // Account for " OR " and quotes
    if (currentQuery.length + termLength > max_query_length) {
      // Add the current query to the list and start a new one
      queries.push('' + currentQuery.slice(0, -4) + '');
      currentQuery = '';
    }
    currentQuery += term + ' OR ';
  }
  // Add the final query to the list
  if (currentQuery) {
    queries.push('' + currentQuery.slice(0, -4) + '');
  }

  queries = queries.map(q => q.replace(/\s*"$/, ''));

  return queries;
}

// function buildGoogleScholarQueries(terms, max_query_length = 255) {
//   let queries = [];
//   let currentQuery = '';
//   for (let i = 0; i < terms.length; i++) {
//     const term = terms[i];
//     const termLength = term.length + 5; // Account for " OR " and quotes
//     if (currentQuery.length + termLength > max_query_length) {
//       // Add the current query to the list and start a new one
//       queries.push('"' + currentQuery.slice(0, -4) + '"');
//       currentQuery = '';
//     }
//     currentQuery += term + '" OR "';
//   }
//   // Add the final query to the list
//   if (currentQuery) {
//     queries.push('"' + currentQuery.slice(0, -5) + '"');
//   }

//   queries = queries.map(q => q.replace(/\s*"$/, ''));

//   return queries;
// }

function buildGoogleScholarUrl(query) {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
}

function generateGoogleSearchUrl(searchTerm) {
  const baseUrl = 'https://www.google.com/search?q=';
  const encodedTerm = encodeURIComponent(searchTerm);
  return `${baseUrl}${encodedTerm}`;
}

function generatePubMedSearchUrl(searchTerm, sort = 'relevance') {
  const baseUrl = 'https://pubmed.ncbi.nlm.nih.gov/';
  const encodedTerm = encodeURIComponent(searchTerm);
  return `${baseUrl}?term=${encodedTerm}&sort=${sort}`;
}

function buildUCSCBrowserUrl(build, chrom, start, end) {
  return `http://genome.ucsc.edu/cgi-bin/hgTracks?db=${build}&lastVirtModeType=default&lastVirtModeExtraState=&virtModeType=default&virtMode=0&nonVirtPosition=&position=chr${chrom}%3A${start}%2D${end}`;
}

function getQueryTerms() {
  let terms = getTextareaContents('terms')
    , add_terms = getTextareaContents('additional-terms', /\s*\n\s*/)
    , qterms = add_terms.length ? combineArrays(terms, add_terms) : terms;

  return qterms;
}

function getSearchQueries() {
  let terms = getQueryTerms()
    , queries = splitArrayByLengthAndWords(terms, 32, 255, ' OR ');

  return queries;
}

function getSearchUrls() {
  let queries = getSearchQueries()
    , urls = queries.map(q => {
        return {
          query: q.join(' OR ')
        , google: generateGoogleSearchUrl(q.join(' OR '))
        , scholar: buildGoogleScholarUrl(q.join(' OR '))
        , pubmed: generatePubMedSearchUrl('(' + q.join(') OR (') + ')')
        }
      });

  return urls;
}

function renderLinksTable() {
  let urls = getSearchUrls()

  if (!urls || !urls.length) {
    $('#links').addClass('d-none');
    return;
  }

  $('#links').removeClass('d-none').find('tbody').html(urls.map(u => {
    return `
      <tr>
        <td name="query">${u.query}</td>
        <td class="text-end">
          <a class="btn btn-primary" href="${u.google}" target="_blank">Google</a>
        </td>
        <td class="text-end">
          <a class="btn btn-success" href="${u.scholar}" target="_blank">Google Scholar</a>
        </td>
        <td class="text-end">
          <a class="btn btn-danger" href="${u.pubmed}" target="_blank">Pubmed</a>
        </td>
      </tr>
    `;
  }).join('\n'));
}

const coordinatesUpdate = _.debounce(async () => {
  let coords = parseChromosomeCoordinates($('#coordinates').val()) || {};

  $('#chromosome').val(coords.chrNum || '');
  $('#start-coord').val(coords.start || '');
  $('#end-coord').val(coords.end || '');
  if (coords.build) $('#genome-build').val(coords.build);

  let chr = $('#chromosome').val()
    , start = $('#start-coord').val()
    , end = $('#end-coord').val()
    , build = $('#genome-build').val();

  if (!chr || !start || !end || !build) {
    $('#ucsc-browser').addClass('d-none');
    $('#cytoband-lookup').addClass('d-none');
    return;
  }

  $('#cytoband-lookup').removeClass('d-none');
  $('#ucsc-browser').attr('href', buildUCSCBrowserUrl(build, chr, start, end)).removeClass('d-none');
}, 500, {
  trailing: true
});

$('#coordinates').on('change input paste', e => {
  coordinatesUpdate();
});

$('#chromosome, #start-coord, #end-coord, #genome-build').on('change input paste', e => {
  coordinatesUpdate();
});

$('[name="terms-format"]').on('change', e => {
  let terms = $('#terms').val();
  fillTextArea('terms', terms, true);
});

$("#terms-copy").click(function() {
  var text = $("#terms").val();
  copyText(text);
});

$('#additional-terms, #terms').on('change keyup input paste', e => {
  renderLinksTable();
});

$('#term-sets').on('change', e => {
  e.preventDefault();

  let val = $(e.target).val();
  setTerms(val);
  renderLinksTable();
});

$('#cytoband-lookup a').on('click', e => {
  e.preventDefault();

  let val = $(e.target).attr('name');

  cytobandLookup(val);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'paste-terms') {
    $('#coordinates').val(request.coordinates);
    coordinatesUpdate();

    let terms = request.terms.split(/\s*,\s*|\n/)
    fillTextArea('terms', terms);
    renderLinksTable();
  }
});
