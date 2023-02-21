async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  if (typeof browser !== 'undefined') {
    let [tab] = await browser.tabs.query(queryOptions);
    return tab;
  } else {
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }
}

async function DecipherPhenotypes() {
	let str = Array.from(document.querySelectorAll('.phenotype-label')).map(e => e.innerText.toLowerCase()).join(', ');
	return str;
}

$('#copy').on('click', async e => {
	e.preventDefault();

	let tab = await getCurrentTab()
		, $el = $('#copy')
		, btn_text = $el.text();
	
	if (!tab.url.match(/^https?:\/\/(www\.)?deciphergenomics\.org\/patient\/[^\/]+\/phenotypes/)) {
 	  $el.toggleClass('btn-warning btn-primary').text('Go to Decipher phenotype page');
 	  setTimeout(function () {
	 	  $el.toggleClass('btn-warning btn-primary').text(btn_text);
 	  }, 1500);
 	  return;
	}

	let res;
	if (typeof browser !== 'undefined') {
		res = await browser.tabs.executeScript(tab.id, { code: `(${DecipherPhenotypes.toString()})()` });
	} else {
		res = await chrome.scripting.executeScript({
			target: {tabId: tab.id},
			func: DecipherPhenotypes
		});
	}

  try {
  	res = res[0];
 	  navigator.clipboard.writeText(res)

 	  $el.toggleClass('btn-success btn-primary').text('Copied!');
 	  setTimeout(function () {
	 	  $el.toggleClass('btn-success btn-primary').text(btn_text);
 	  }, 1500);
  } catch (e) {

  }

});
