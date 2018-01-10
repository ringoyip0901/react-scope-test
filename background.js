const connections = {};

chrome.runtime.onConnect.addListener((devtoolsConnections) => {
  var devtoolsListener = (message, sender, sendResponse) => {
    chrome.tabs.executeScript(message.tabId, { file: 'content_script.js'});
  }

  devtoolsConnections.onMessage.addListener(devtoolsListener);

  devtoolsConnections.onDisconnect.addListener(() => {
    devtoolsConnections.onMessage.removeListener(devtoolsListener);
  });
});

chrome.runtime.onConnect.addListener(function (port) {
  let devtoolListener = (message) => {
    if (message.name == 'connect' && message.tabId) {
      chrome.tabs.sendMessage(message.tabId, message)
      connections[message.tabId] = port;
    }
  }
  port.onMessage.addListener(devtoolListener);
  port.onDisconnect.addListener(function(port) {
    port.onMessage.removeListener(devtoolListener)

    let tabs = Object.keys(connections)
    for (let i = 0; i < tabs.length; i++) {
      if (connections[tabs[i] == port]) {
        delete connections[tabs[i]]
        break;
      }
    }
  })
});

chrome.runtime.onMessage.addListener(function (req, sender, res) {
  // if (sender.tab) {
  //   let tabId = sender.tab.id;
  //   if (tabId in connections) {
  //     connections[tabId].postMessage(req)
  //   } else {
  //     alert('Tab not found!');
  //   }
  // } else {
  //   alert('Sender.tab is not defined');
  // }
  // return true;
});
