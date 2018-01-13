function injectScript(file, body) {
  const bodyHead = document.getElementsByTagName(body)[0];
  const script = document.createElement('script');

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file);
  bodyHead.appendChild(script);
}

window.addEventListener('message', (event) => {
  if (event.source !== window) 
  console.log(event)
  return;
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   const newEvent = new Event('React-Scope-Test');
//   window.dispatchEvent(newEvent);
// });

window.addEventListener("React-Scope-Test", (message) => {
  chrome.runtime.sendMessage(message.detail)
}, false)

// chrome.runtime.onMessage.addListener(() => {
//   var customEvent = new CustomEvent("React-Scope-Test", {data: "hello there!!!"});
// 	window.dispatchEvent(customEvent)
// })

injectScript(chrome.runtime.getURL('hook.js'), 'body');

// alert(JSON.stringify(chrome.runtime.getURL('hook.js')))
