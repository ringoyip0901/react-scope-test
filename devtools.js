let storage = {};

chrome.devtools.panels.create(
  'React-Scope-Test',//title of the panel
  null, //the path to the icon
  'devtools.html', //html page for injecting into the tab's content
  sendMessage() //callback function optional
);

function sendMessage() {
  console.log('React-Scope-Test s Console')
  var node = document.createElement('h2');
  var textnode = document.createTextNode("hola");
  node.appendChild(textnode);
  document.getElementById('app').appendChild(node)


  let port = chrome.runtime.connect({
    name: "lcmkobafpahiadgbnmjhhgoibckdbeko",
    // name: "devtools-page"
    // name: "React-Scope-Test" //gives you Tab not Found
  });

  port.postMessage({
    name: 'connect', 
    tabId: chrome.devtools.inspectedWindow.tabId
  })

  port.onMessage.addListener((msg) => {
    if (!msg.data) {
      console.log(msg)
      console.log('There is no data');
      return;
    }
    else {
      console.log("data is here")
      console.log(msg)
      storage = msg;
      console.log(storage)
      return
    }
  })

};