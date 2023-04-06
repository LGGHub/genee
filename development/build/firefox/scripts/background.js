async function getTabUrl(tabId) {
  return (await browser.tabs.get(tabId)).url;
}

async function setAction(tabId) {
  let url = await getTabUrl(tabId) || '';

  if (url.match(/^https?:\/\/(www\.)?deciphergenomics\.org\/patient\/[^\/]+\/phenotypes/)) {
    await browser.action.setPopup({
      popup: 'views/decipher.html'
    });
  } else if (url.match(/^https?:\/\/genome\.ucsc\.edu\/cgi\-bin\/hgTracks/)) {

    await browser.action.setPopup({
      popup: '/views/ucsc.html'
    });
  } else {
    await browser.action.setPopup({
      popup: ''      
    });
  }
}

browser.tabs.onActivated.addListener(async activeInfo => {
  await setAction(activeInfo.tabId);
});

let dashboard = {};

browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  await setAction(tabId);

  if (tabId === dashboard.tab && changeInfo.status === 'complete') {
    browser.tabs.sendMessage(dashboard.tab, {
      action: 'paste-terms'
    , terms: dashboard.terms
    , coordinates: dashboard.coordinates
    });
    dashboard = {};
  }
});

browser.action.onClicked.addListener(() => {
  browser.tabs.create({
    url: '/views/dashboard.html'
  });
});

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'open-dashboard') {
    dashboard = {};
    dashboard.terms = message.terms;
    dashboard.coordinates = message.coordinates;

    let tab = await browser.tabs.create({
      url: '/views/dashboard.html'
    });

    dashboard.tab = tab.id;
  }
});
