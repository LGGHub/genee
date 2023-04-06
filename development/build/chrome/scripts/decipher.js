function getDecipherPhenotypes() {
	let arr = Array.from(document.querySelectorAll('.phenotype-label')).map(e => e.innerText.toLowerCase());
	return arr;
}

$(document).ready(async () => {
  let tab = await getCurrentTab()
    , res = await browser.scripting.executeScript({
        target: {tabId: tab.id},
        func: getDecipherPhenotypes
      });
  
  res = _.get(res, '[0].result');

  fillTextArea('terms', res);
});

$('[name="terms-format"]').on('change', e => {
  let terms = $('#terms').val();
  fillTextArea('terms', terms, true);
});

$("#terms-copy").click(function() {
  let text = $("#terms").val();
  copyText(text);
});
