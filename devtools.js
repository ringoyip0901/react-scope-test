let storage = {};

chrome.devtools.panels.create(
  'React-Scope-Test',//title of the panel
  null, //the path to the icon
  'devtools.html', //html page for injecting into the tab's content
  sendMessage //callback function optional
);

function sendMessage() {
  console.log('React-Scope-Test s Console')
  let port = chrome.runtime.connect({
    name: "lcmkobafpahiadgbnmjhhgoibckdbeko",
  });
  port.postMessage({
    name: 'connect', 
    tabId: chrome.devtools.inspectedWindow.tabId
  })
  port.onMessage.addListener((msg) => {
    if (!msg.data) {
      console.log(msg)
      console.log('There is no data');
    }
    else {
      console.log("data is here")
      storage = msg;
      console.log(storage)
      let example = storage.data[1].children[3].name;
      var node = document.createElement('h2');
      var textnode = document.createTextNode(example);
      node.appendChild(textnode);
      document.getElementById('app').appendChild(node);
    }
  })
};