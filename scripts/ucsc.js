let TRACKS;
  // , GENES
  // , GENES_REGEX;

function getTrackData() {
  function getTracks() {
    let tracks = Array.from(document.querySelectorAll('tr[id^="tr_"]'));
    //tracks = tracks.map(t => t.id.replace(/^tr\_/, ''));
    return tracks;
  }

  function getAreaTitles(el=document) {
    let areas = Array.from(el.querySelectorAll('area[title]'));
    areas = areas.map(t => t.getAttribute('title'));
    return areas;
  }

  let tracks = getTracks()
    , data = {};
  
  tracks.forEach(el => {
    let track = el.id.replace(/^tr\_/, '');
    data[track] = getAreaTitles(el);
  });
  
  return data;
}

async function renderTrackSelect() {
  let tab = await getCurrentTab()
    , res = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: getTrackData
      });
  
  TRACKS = _.get(res, '[0].result');
  if (!TRACKS) {
    $('#tracks').html('<option value="">Add tracks or refresh page</option>');
    return;
  }

  //console.log(TRACKS);

  let tracks = [];

  if (TRACKS.omimGene2) {
    let cur_track = TRACKS.omimGene2
      , track_name = 'OMIM Morbid Genes'
      , track = []
      , pattern = /Gene:\s+(\w+),?/;

    _.each(cur_track, c => {
      if (!c.match(/Phenotype/)) return;

      let matches = c.match(pattern);
      if (!matches) return;

      let gene = matches[1]
        , desc = c.split(gene).pop();

      if (desc.match(/\b(AR)\b/)) return;
      if (!desc.match(/\b(AD|XL|XLR|XLD)\b/)) return;

      track.push(gene);
    });

    track = _.uniq(track);
    if (track.length) {
      TRACKS[track_name] = track
      tracks.push(track_name);
    }
  }

  if (TRACKS.clinGenHaplo) {
    let cur_track = TRACKS.clinGenHaplo
      , track_name = 'Clingen Haplo Genes'
      , track = []
      , pattern = /Gene\/ISCA ID:\s*(\w+)/;

    _.each(cur_track, c => {
      if (!c.match(/(sensitivity|sufficiency):\s*(1|2|3)\s*\-/)) return;

      let matches = c.match(pattern);
      if (!matches) return;

      let gene = matches[1];
      if (gene.match(/^ISCA\-/)) return;

      track.push(gene);
    });

    track = _.uniq(track);
    if (track.length) {
      TRACKS[track_name] = track
      tracks.push(track_name);
    }
  }

  if (TRACKS.clinGenHaplo) {
    let cur_track = TRACKS.clinGenTriplo
      , track_name = 'Clingen Triplo Genes'
      , track = []
      , pattern = /Gene\/ISCA ID:\s*(\w+)/;

    _.each(cur_track, c => {
      if (!c.match(/(sensitivity|sufficiency):\s*(1|2|3)\s*\-/)) return;

      let matches = c.match(pattern);
      if (!matches) return;

      let gene = matches[1];
      if (gene.match(/^ISCA\-/)) return;
      
      track.push(gene);
    });

    track = _.uniq(track);
    if (track.length) {
      TRACKS[track_name] = track
      tracks.push(track_name);
    }
  }

  TRACKS = _.pick(TRACKS, tracks);

  if (!_.size(TRACKS)) {
    $('#tracks').html('<option value="">Add tracks or refresh page</option>');
    return;
  }
  
  // TRACKS = _.mapValues(TRACKS, t => {
  //   return _.uniq(_.compact(_.flatten(t.map(v => {
  //     return v.match(GENES_REGEX);
  //   }))));
  // });

  // TRACKS = _.pickBy(TRACKS, t => t.length);

  let val = $('#tracks').val();

  // let tracks = _.sortBy(_.keys(TRACKS), s => {
  //   if (s === 'OMIM Morbid Genes') return -100;
  //   if (s === 'Clingen Genes') return -90;

  //   return 0;
  // });

  $('#tracks').html(_.map(tracks, (r) => {
    return `<option value="${r}"` + (r === val ? ` selected` : '') + `>${r}</option>`;
  }).join('\n'));

  selectTrack(_.keys(TRACKS)[0]);
}

function selectTrack(track) {
  track = track || $('#tracks').val();
  if (!TRACKS[track]) return;

  fillTextArea('terms', TRACKS[track]);
}

async function getCoordinates() {
  let tab = await getCurrentTab()
    , res = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => document.getElementById('position').value
      });
  
  res = _.get(res, '[0].result');
  return res;
}

$('#tracks').on('input', e => {
  selectTrack();
});

$('#tracks option').on('click', e => {
  selectTrack();
});

$('[name="terms-format"]').on('change', e => {
  let terms = $('#terms').val();
  fillTextArea('terms', terms, true);
});

$("#terms-copy").click(function() {
  let text = $("#terms").val();
  copyText(text);
});

$('#google-scholar-search').on('click', async e => {
  e.preventDefault();

  let terms = $("#terms").val()
    , coordinates = await getCoordinates();

  chrome.runtime.sendMessage({
    action: 'open-dashboard'
  , terms
  , coordinates
  });
});

renderTrackSelect();

// fetch('assets/data/genes.json')
//   .then(response => response.json())
//   .then(data => {
//     GENES = data.map(m => m.toLowerCase());
//     const escapedSubstrings = GENES.map(sub => sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
//     GENES_REGEX = new RegExp(`\\b(${escapedSubstrings.join('|')})\\b`, 'gi');

//     renderTrackSelect();
//     // runFunctionContinuously(renderTrackSelect, 2000);
//   })
//   .catch(error => {
//     console.error(error);
//   });
