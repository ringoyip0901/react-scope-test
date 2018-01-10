function injectScript(file, body) {
  const bodyHead = document.getElementsByTagName(body)[0];
  const script = document.createElement('script');

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file);
  bodyHead.appendChild(script);
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  chrome.runtime.sendMessage(event.data, () => {
    if (typeof event.data === 'object') {
      alert('[Content Script] received data');
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // add stuff here
});

injectScript(chrome.runtime.getURL('hook.js'), 'body');

// alert(JSON.stringify(chrome.runtime.getURL('hook.js')))
