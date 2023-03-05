async function getTabUrl(tabId) {
  return (await chrome.tabs.get(tabId)).url;
}

async function setAction(tabId) {
  let url = await getTabUrl(tabId) || '';
  //if (url.match(/deciphergenomics\.org/)) {
  if (url.match(/^https?:\/\/(www\.)?deciphergenomics\.org\/patient\/[^\/]+\/phenotypes/)) {
    await chrome.action.setPopup({
      popup: 'views/decipher.html'
    });
  //} else if (url.match(/ucsc\.edu/)) {
  } else if (url.match(/^https?:\/\/genome\.ucsc\.edu\/cgi\-bin\/hgTracks/)) {

    await chrome.action.setPopup({
      popup: '/views/ucsc.html'
    });
  } else {
    await chrome.action.setPopup({
      popup: ''      
    //  popup: 'dashboard.html'
    });
  }
}

chrome.tabs.onActivated.addListener(async activeInfo => {
  await setAction(activeInfo.tabId);
});

let dashboard = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  await setAction(tabId);

  if (tabId === dashboard.tab && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(dashboard.tab, {
      action: 'paste-terms'
    , terms: dashboard.terms
    , coordinates: dashboard.coordinates
    });
    dashboard = {};
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: '/views/dashboard.html'
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'open-dashboard') {
    dashboard = {};
    dashboard.terms = message.terms;
    dashboard.coordinates = message.coordinates;

    let tab = await chrome.tabs.create({
      url: '/views/dashboard.html'
    });

    dashboard.tab = tab.id;
  }
});

// let GENES
//   , GENES_REGEX;

// fetch('assets/data/genes.json')
//   .then(response => response.json())
//   .then(data => {
//     GENES = data.map(m => m.toLowerCase());
//     const escapedSubstrings = GENES.map(sub => sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
//     GENES_REGEX = new RegExp(`\\b(${escapedSubstrings.join('|')})\\b`, 'gi');
//   })
//   .catch(error => {
//     console.error(error);
//   });
