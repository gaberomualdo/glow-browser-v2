const allTabsElm = document.querySelector('.app-container .meta .tabs-container ul.all-tabs');
const webviewsElm = document.querySelector('.app-container .webviews');
const queryInputElm = document.querySelector('#url-or-search-query');

const backBtnElm = document.querySelector('.app-container .meta .topbar > .misc-buttons button.back');
const forwardBtnElm = document.querySelector('.app-container .meta .topbar > .misc-buttons button.forward');
const refreshBtnElm = document.querySelector('.app-container .meta .topbar > .misc-buttons button.refresh');

const newTabURL = 'https://www.google.com/';

let allTabs = [];

let removingATab = false;

const updateQueryInputForTabURL = (idx) => {
  const newValue = allTabs[idx].url === newTabURL ? '' : allTabs[idx].url;
  if (newValue !== queryInputElm.value) {
    queryInputElm.value = newValue;
  }
};

const getTabElm = (idx) => {
  return document.querySelector(`.app-container .meta .tabs-container ul.all-tabs li:nth-child(${idx + 1})`);
};
const getWebviewElm = (idx) => {
  return document.querySelector(`.app-container .webviews webview:nth-child(${idx + 1})`);
};

const getIdxFromWebviewElm = (webview) => {
  return Array.from(document.querySelectorAll('.app-container .webviews webview')).indexOf(webview);
};

const getActiveTabIdx = () => {
  let currentTabIdx = -1;
  allTabs.forEach((e, i) => {
    if (e.active) {
      currentTabIdx = i;
    }
  });
  return currentTabIdx;
};

const setTabActiveStatus = (idx, newActiveStatus) => {
  if (newActiveStatus === true) {
    const activeTabIdx = getActiveTabIdx();

    if (idx !== activeTabIdx) {
      if (activeTabIdx > -1) {
        setTabActiveStatus(activeTabIdx, false);
      }
      updateQueryInputForTabURL(idx);
      updateForwardBackwardBtnsDisabled();
    }
  }
  const status = newActiveStatus ? true : false;
  allTabs[idx].active = status;
  getTabElm(idx).setAttribute('active', status.toString());
  getWebviewElm(idx).setAttribute('active', status.toString());
};

const removeTab = (tabIdx) => {
  if (removingATab) return;

  const tabElm = getTabElm(tabIdx);
  const webviewElm = getWebviewElm(tabIdx);
  tabElm.classList.add('removing');
  removingATab = true;
  setTimeout(() => {
    allTabs.splice(tabIdx, 1);
    allTabsElm.removeChild(tabElm);
    webviewsElm.removeChild(webviewElm);
    setTabActiveStatus(allTabs.length - 1, true);
    removingATab = false;
  }, 300);
};

const removeTabFromTabElm = (tabElm) => {
  const tabIdx = Array.from(document.querySelectorAll('.app-container .meta .tabs-container ul.all-tabs li')).indexOf(tabElm);
  removeTab(tabIdx);
};

const setTabActiveFromElm = (tabElm) => {
  const tabIdx = Array.from(document.querySelectorAll('.app-container .meta .tabs-container ul.all-tabs li')).indexOf(tabElm);
  setTabActiveStatus(tabIdx, true);
};

const addTab = (url) => {
  allTabs.push({
    url,
  });

  const newTabElm = document.createElement('li');
  newTabElm.setAttribute('onclick', 'setTabActiveFromElm(this)');
  newTabElm.innerHTML = `<div class="favicon loaded">
    <div class="preloader-wrapper small active">
      <div class="spinner-layer spinner-blue">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>

      <div class="spinner-layer spinner-red">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>

      <div class="spinner-layer spinner-yellow">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>

      <div class="spinner-layer spinner-green">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
    <img class="favicon-image" src="assets/img/icon.png"></img>
  </div>
  <p>${url === newTabURL ? 'New Tab' : 'Loading...'}</p>
  <button onclick="removeTabFromTabElm(this.parentElement)" class="delete-tab btn-floating grey-icon btn-flat btn-large waves-effect btn-small">
    <i class="material-icons">close</i>
  </button>`;
  allTabsElm.appendChild(newTabElm);

  const newTabWebview = document.createElement('webview');
  newTabWebview.setAttribute('src', url);

  // webview events
  newTabWebview.addEventListener('page-title-updated', (e) => {
    getTabElm(getIdxFromWebviewElm(e.target)).querySelector('p').innerText = e.title;
  });
  newTabWebview.addEventListener('did-start-loading', (e) => {
    getTabElm(getIdxFromWebviewElm(e.target)).querySelector('.favicon').classList.remove('loaded');
  });
  newTabWebview.addEventListener('did-stop-loading', (e) => {
    const tabIdx = getIdxFromWebviewElm(e.target);
    const webview = getWebviewElm(tabIdx);
    const tabElm = getTabElm(tabIdx);
    updateForwardBackwardBtnsDisabled();

    const currentURL = webview.src;

    tabElm.querySelector('.favicon img').src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(currentURL.split('?')[0])}`;
    tabElm.querySelector('.favicon').classList.add('loaded');

    allTabs[tabIdx].url = currentURL;

    updateQueryInputForTabURL(tabIdx);
  });
  newTabWebview.addEventListener('new-window', (e) => {
    addTab(e.url);
  });

  webviewsElm.appendChild(newTabWebview);

  newTabWebview.focus();

  setTabActiveStatus(allTabs.length - 1, true);

  if (url === newTabURL) {
    queryInputElm.focus();
  }
};

const updateForwardBackwardBtnsDisabled = () => {
  const webview = getWebviewElm(getActiveTabIdx());
  if (webview) {
    if (!webview.canGoForward()) {
      forwardBtnElm.setAttribute('disabled', 'true');
    } else {
      forwardBtnElm.removeAttribute('disabled');
    }
    if (!webview.canGoBack()) {
      backBtnElm.setAttribute('disabled', 'true');
    } else {
      backBtnElm.removeAttribute('disabled');
    }
  }
};

window.addEventListener('load', () => {
  queryInputElm.addEventListener('keydown', (e) => {
    const searchEngines = [
      '@twitter',
      '@google',
      '@bing',
      '@github',
      '@yahoo',
      '@wikipedia',
      '@duckduckgo',
      '@wikihow',
      '@amazon',
      '@steam',
      '@guardian',
      '@nytimes',
      '@cnn',
    ];
    const searchEngineStart = [
      'http://twitter.com/search?q=',
      'http://google.com/search?q=',
      'http://www.bing.com/search?q=',
      'http://github.com/search?q=',
      'http://search.yahoo.com/search?q=',
      'http://en.wikipedia.org/w/index.php?search=',
      'http://duckduckgo.com/?q=',
      'https://www.wikihow.com/wikiHowTo?search=',
      'https://www.amazon.com/s/?field-keywords=',
      'http://store.steampowered.com/search/?term=',
      'https://www.google.co.uk/search?as_sitesearch=www.theguardian.com&q=',
      'https://www.nytimes.com/search/',
      'https://edition.cnn.com/search/?q=',
    ];

    if (e.key === 'Enter') {
      let url = queryInputElm.value;
      queryInputElm.blur();

      if (url.indexOf(' ') != -1 || url.indexOf('.') == -1) {
        const searchEngine = searchEngines.indexOf(url.split(' ')[0]);
        if (searchEngine != -1) {
          url = url.split(' ');
          url[0] = '';
          url = url.join(' ');
          url = url.substring(1);
          url = searchEngineStart[searchEngine] + url;
        } else {
          url = 'https://google.com/search?q=' + url;
        }
      }
      if (!url.startsWith('http://') && !url.startsWith('file://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }

      const webview = getWebviewElm(getActiveTabIdx());
      webview.loadURL(url);
      webview.focus();
    }
  });

  backBtnElm.addEventListener('click', () => {
    getWebviewElm(getActiveTabIdx()).goBack();
  });
  forwardBtnElm.addEventListener('click', () => {
    getWebviewElm(getActiveTabIdx()).goForward();
  });
  refreshBtnElm.addEventListener('click', () => {
    getWebviewElm(getActiveTabIdx()).reload();
  });
});

addTab(newTabURL);

// $(function () {
//   updateEvents();
// });

// $(document).on('resize', function (e) {
//   updateTabWidth();
// });

// function checkForwardBackwardBtns() {
//   if (!$('#web webview.activeWeb')[0].canGoForward()) {
//     $('#topbar button.forward').addClass('disabled');
//   } else {
//     $('#topbar button.forward').removeClass('disabled');
//   }
//   if (!$('#web webview.activeWeb')[0].canGoBack()) {
//     $('#topbar button.back').addClass('disabled');
//   } else {
//     $('#topbar button.back').removeClass('disabled');
//   }
// }

// function addTab(url) {
//   allTabs.push(url);
//   $('#tabs div.activeTab').removeClass('activeTab');
//   $(
//     '<div class="activeTab"><img src="assets/img/loader.gif" onerror="this.setAttribute("src","favicon.png")"><h1>New Tab</h1><span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg></span></div>'
//   ).insertAfter($('#tabs div:eq(' + (allTabs.length - 2) + ')'));

//   $('#web webview.activeWeb').removeClass('activeWeb');
//   $("<webview class='activeWeb' src='" + url + "'></webview>").insertAfter($('#web webview:eq(' + (allTabs.length - 2) + ')'));

//   $('#topbar input.activeInput').removeClass('activeInput');
//   $('<input class="activeInput" type="text" placeholder="Type URL or Search Google...">').insertAfter(
//     $('#topbar input:eq(' + (allTabs.length - 2) + ')')
//   );

//   if (url == newTabURL) {
//     $('#topbar input.activeInput').focus();
//   }

//   updateEvents();
//   updateTabWidth();
// }
// function removeTab(index) {
//   allTabs.splice(index, 1);
//   $('#tabs div:eq(' + index + ')').remove();
//   $('#web webview:eq(' + index + ')').remove();
//   $('#topbar input:eq(' + index + ')').remove();

//   if (allTabs.length == 0) {
//     remote.getCurrentWindow().close();
//   }
//   if ($('#tabs div.activeTab').length == 0) {
//     if (index == 0) {
//       $('#web webview:eq(' + index + ')').addClass('activeWeb');
//       $('#tabs div:eq(' + index + ')').addClass('activeTab');
//       $('#topbar input:eq(' + index + ')').addClass('activeInput');
//     } else {
//       $('#web webview:eq(' + (index - 1) + ')').addClass('activeWeb');
//       $('#tabs div:eq(' + (index - 1) + ')').addClass('activeTab');
//       $('#topbar input:eq(' + (index - 1) + ')').addClass('activeInput');
//     }
//   }

//   updateTabWidth();
// }
// function updateEvents() {
//   $('#tabs div span').off('click');
//   $('#tabs div span').on('click', function () {
//     var index = $('#tabs div').index($(this).parent());
//     removeTab(index);
//   });

//   $('#tabs div').off('click');
//   $('#tabs div').on('click', function (e) {
//     $('#tabs div.activeTab').removeClass('activeTab');
//     $(this).addClass('activeTab');

//     var index = $('#tabs div').index($(this));

//     $('#web webview.activeWeb').removeClass('activeWeb');
//     $('#web webview:eq(' + index + ')').addClass('activeWeb');

//     $('#topbar input.activeInput').removeClass('activeInput');
//     $('#topbar input:eq(' + index + ')').addClass('activeInput');
//     checkForwardBackwardBtns();
//   });

//   $('#topbar input').off('keydown');
//   $('#topbar input').on('keydown', function (e) {
//     var searchEngines = [
//       '@twitter',
//       '@google',
//       '@bing',
//       '@github',
//       '@yahoo',
//       '@wikipedia',
//       '@duckduckgo',
//       '@wikihow',
//       '@amazon',
//       '@steam',
//       '@guardian',
//       '@nytimes',
//       '@cnn',
//     ];
//     var searchEngineStart = [
//       'http://twitter.com/search?q=',
//       'http://google.com/search?q=',
//       'http://www.bing.com/search?q=',
//       'http://github.com/search?q=',
//       'http://search.yahoo.com/search?q=',
//       'http://en.wikipedia.org/w/index.php?search=',
//       'http://duckduckgo.com/?q=',
//       'https://www.wikihow.com/wikiHowTo?search=',
//       'https://www.amazon.com/s/?field-keywords=',
//       'http://store.steampowered.com/search/?term=',
//       'https://www.google.co.uk/search?as_sitesearch=www.theguardian.com&q=',
//       'https://www.nytimes.com/search/',
//       'https://edition.cnn.com/search/?q=',
//     ];

//     if (e.keyCode == 13) {
//       var url = $(this).val();
//       $(this).blur();

//       if (url.indexOf(' ') != -1 || url.indexOf('.') == -1) {
//         var searchEngine = searchEngines.indexOf(url.split(' ')[0]);
//         if (searchEngine != -1) {
//           url = url.split(' ');
//           url[0] = '';
//           url = url.join(' ');
//           url = url.substring(1);
//           url = searchEngineStart[searchEngine] + url;
//         } else {
//           url = 'https://google.com/search?q=' + url;
//         }
//       }
//       if (!url.startsWith('http://') && !url.startsWith('file://') && !url.startsWith('https://')) {
//         url = 'https://' + url;
//       }

//       var fakeA = document.createElement('a');
//       fakeA.href = url;

//       var index = $('#tabs div').index($('#tabs div.activeTab'));

//       $('#web webview:eq(' + index + ')')[0].loadURL(url);
//       $('#web webview:eq(' + index + ')')[0].focus();
//     }
//   });

//   $('#web webview.activeWeb')[0].addEventListener('page-title-updated', (e) => {
//     var index = $('#web webview').index($(this));
//     $('#tabs div h1:eq(' + index + ')').text(e.title);
//   });

//   $('#web webview').off('did-start-loading');
//   $('#web webview').on('did-start-loading', function () {
//     var index = $('#web webview').index($(this));
//     $('#tabs div img:eq(' + index + ')').attr('src', 'assets/img/loader.gif');
//   });

//   $('#web webview').off('did-stop-loading');
//   $('#web webview').on('did-stop-loading', function () {
//     $(this).blur();
//     var index = $('#web webview').index($(this));
//     if (!$('#topbar input:eq(' + index + ')').is(':focus')) {
//       if ($(this).attr('src').endsWith(newTabURL)) {
//         $('#topbar input:eq(' + index + ')').val('');
//       } else {
//         $('#topbar input:eq(' + index + ')').val($(this).attr('src'));
//       }
//     }
//     if ($(this).attr('src').endsWith(newTabURL)) {
//       $('#tabs div img:eq(' + index + ')').attr('src', 'assets/img/icon_no_border.png');
//     } else {
//       $('#tabs div img:eq(' + index + ')').attr('src', 'https://www.google.com/s2/favicons?domain=' + $(this).attr('src').split('?')[0]);
//     }
//     checkForwardBackwardBtns();
//   });

//   $('#web webview.activeWeb')[0].addEventListener('new-window', (e) => {
//     addTab(e.url);
//   });

//   $('#topbar input').off('focus');
//   $('#topbar input').on('focus', function () {
//     $(this)[0].select();
//   });
// }

// $('#tabs button.addTab').on('click', function () {
//   addTab(newTabURL);
// });

// $('#topbar button.back').on('click', function () {
//   $('#web webview.activeWeb')[0].goBack();
// });
// $('#topbar button.forward').on('click', function () {
//   $('#web webview.activeWeb')[0].goForward();
// });
// $('#topbar button.reload').on('click', function () {
//   $('#web webview.activeWeb')[0].reload();
// });
