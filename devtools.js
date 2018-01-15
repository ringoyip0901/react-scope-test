chrome.devtools.panels.create(
  'React-Scope-Test',//title of the panel
  null, //the path to the icon
  'devtools.html', //html page for injecting into the tab's content
  sendMessage //callback function optional
);

let storage = {};
let cleanData = []

function sendMessage() {
  console.log('React-Scope-Test Console')
  let port = chrome.runtime.connect({
    name: "ilhfmcnjanhibheilakfaahiehikcmgf",
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
      console.log(msg, "raw data")
      let reactData = msg;
      if (reactData.data.head) {
        reactData = reactData.data.head.value.currentState[1].children[3]
        cleanData.push(getChildren(reactData))
        console.log(cleanData, 'result')
      }
     // let example = 'hello';
      // var node = document.createElement('h4');
      // var textnode = document.createTextNode(example);
      // node.appendChild(textnode);
      // document.getElementById('app').appendChild(node);
   }
  })
};

function getChildren(child) {
  let result = []
  let node = child

 if (node.name !== 'div') {
    result.push({
      name : node.name,
      props : node.props,
      state : node.state,
    })
  }
  
 for (keys in node.children) {
    result = result.concat(getChildren(node.children[keys]))
  }
  return result
}