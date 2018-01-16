//adding version 15 
const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
const rid = Object.keys(reactInstances)[0];
const reactInstance = reactInstances[rid];
const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

let fiberDOM;
let currState;
let initialState;
const saveCache = new StateCache();

// get initial state and only run once
function getInitialStateOnce() {
  console.log("getInitialStateOnce is running")
  let run = false;
  return function getInitialState() {
    if (!run) {
      // grab initial state
      const initStateSet = devTools._fiberRoots[rid];
      initStateSet.forEach(item => {
        initialState = item;
      });
      // parse state
      initialState = checkReactDOM(initialState.current.stateNode);
      // stringify data
      initialState = stringifyData(initialState);
      run = true;
    }
  };
}

// convert data to JSON for storage
function stringifyData(obj) {
  let box = [];
  const data = JSON.parse(
    JSON.stringify(obj, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (box.indexOf(value) !== -1) {
          return;
        }
        box.push(value);
      }
      return value;
    })
  );
  box = null;
  return data;
}

const setInitialStateOnce = getInitialStateOnce();

// set initial state
(function setInitialState() {
  console.log("setInitiatl State is running ")
  setInitialStateOnce();
  // add to event loop
  setTimeout(() => {
    saveCache.addToHead(initialState);
    transmitData(saveCache);
  }, 100);
})();

// Monkey patch to listen for state changes
devTools.onCommitFiberRoot = (function(original) {
  return function(...args) {
    getFiberDOM(args[1]);
    return original(...args);
  };
})(devTools.onCommitFiberRoot);

//async version -- should we check for older browsers?!?!?! or use promises?!
async function getFiberDOM(instance) {
  console.log("getFiberDOM is running")
  try {
    fiberDOM = await instance;
    currState = await checkReactDOM(fiberDOM);

    saveCache.addToHead(currState);
    transmitData(saveCache);
    console.log('updated cache', saveCache);
  } catch (e) {
    console.log(e);
  }
}

// traverse React 16 fiber DOM
function traverseComp(node, cache) {
  //LinkedList Style
  const component = {
    name: '',
    state: null,
    props: null,
    children: {},
  };

  //consider using switch/case
  if (node.type) {
    if (node.type.name) {
      component.name = node.type.name;
    } else {
      component.name = node.type || 'Default';
    }
  }

  if (node.memoizedState) {
    component.state = node.memoizedState;
  }

  if (node.memoizedProps) {
    let props = [];
    if (typeof node.memoizedProps === 'object') {
      let keys = Object.keys(node.memoizedProps);
      keys.forEach(key => {
        props.push(node.memoizedProps[key]);
      });
      component.props = props[0] || props; //need to parse the props if it is a function or an array or an object
    } else {
      component.props = node.memoizedProps;
    }
  }

  if (node._debugID) {
    cache[node._debugID] = component;
  } else if (!node._debugID) {
    cache['Default ID'] = component;
	}
	
	component.children = {};
  if (node.child !== null) {
    traverseComp(node.child, component.children);
  }
  if (node.sibling !== null) {
    traverseComp(node.sibling, cache);
  }
}

//check if reactDOM is even valid
function checkReactDOM(reactDOM) {
  console.log("checkReactDOM is running")
  let data = { currentState: null };
  let cache = {};
  if (reactDOM) {
    // console.log(reactDOM.current);
    traverseComp(reactDOM.current, cache); //maybe there is no need to use stateNode.current
  } else {
    return;
	}
	data.currentState = cache;
  // console.log('Store with Hierarchy: ', data);
  return data;
}

function transmitData(cache) {
  var customEvent = new CustomEvent("React-Scope-Test", {detail: { //create a custom event to dispatch for actions for requesting data from background
    data: stringifyData(cache)
  }});
  window.dispatchEvent(customEvent)
}

//Here we are using a doubly linked list to store state changes
function StateCache() {
  this.head = null;
  this.tail = null;
}

function Node(val) {
  this.value = val;
  this.next = null;
  this.prev = null;
}

StateCache.prototype.addToHead = function(value) {
  const data = stringifyData(value)
  const node = new Node(data);

  if (!this.head) {
    this.head = node;
    this.tail = node;
  } else {
    node.prev = this.head;
    this.head.next = node;
    this.head = node;
  }
};
