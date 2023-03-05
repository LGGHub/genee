async function getCurrentTab() {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function runFunctionContinuously(func, delay) {
  func();

  setTimeout(() => {
    runFunctionContinuously(func, delay);
  }, delay);
}

function combineArrays(array1, array2) {
  const combinedArray = [];
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      combinedArray.push(array1[i] + ' ' + array2[j]);
    }
  }
  return combinedArray;
}

function getTextareaContents(label, delimeter) {
  let val = $(`#${label}`).val();
  delimeter = delimeter || $(`[name=${label}-format]:checked`).val() === 'one-per-line' ? /\s*\n\s*/ : /\s*,\s*/;

  val = val.split(delimeter) || [];
  val = _.filter(val, v => (v || '').match(/\w/));

  return val;
}

function fillTextArea(label, text, split) {
  let delimeter = $(`[name=${label}-format]:checked`).val() === 'one-per-line' ? '\n' : ', ';

  if (split) text = text.split(delimeter === '\n' ? /\s*,\s*/ : /\n/);

  $(`#${label}`).val(text.join(delimeter));
}

$('[name="terms-format"]').on('change', e => {
  let terms = $('#terms').val();
  fillTextArea('terms', terms, true);
});

function copyText(text) {
  let copyTextarea = $("<textarea/>");
  copyTextarea.text(text);
  $("body").append(copyTextarea);
  copyTextarea.select();
  document.execCommand("copy");
  copyTextarea.remove();
}
