//addded code for version 16 or lower
const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
const rid = Object.keys(reactInstances)[0];
const reactInstance = reactInstances[rid];
const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

let fiberDOM;
let currState;
let initialState;
const saveCache = new StateCache();

let runFifteen = false;

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


// Monkey patch to listen for state changes 
//has to be in IFFY?
(function connectReactDevTool() {
  console.log('entering connectReactDevTool')
  //for react16 or 16+
  if (reactInstance.version) {
    devTools.onCommitFiberRoot = (function(original) {
      return function(...args) {
        getFiberDOM16(args[1]);
        return original(...args);
      };
    })(devTools.onCommitFiberRoot);
  }

  //for react 16 or lower 
  else if (reactInstance.Mount) {
    reactInstance.Reconciler.receiveComponent = (function(original) {
      return function(...args) {
        if (!runFifteen) {
          runFifteen = true;
          setTimeout(() => {
            getFiberDOM15(); //here you are getting the data from the DOM 
            runFifteen = false;
          }, 10);
        }
        return original(...args);
      };
    })(reactInstance.Reconciler.receiveComponent)
  }
})();

// set initial state
const setInitialStateOnce = getInitialStateOnce();
(function setInitialState() {
  if (reactInstance && reactInstance.version) {
    //get initial state for 16 or higher 
    console.log("setInitial State is running ")
    setInitialStateOnce();
    setTimeout(() => {
      saveCache.addToHead(initialState);
      console.log('initial cache: ', saveCache)
      transmitData(initialState);
    }, 100);
  }
  else if (reactInstance && reactInstance.Mount) {
    //get intiial state for 15
    console.log('getting intial state for 15')
    getFiberDOM15();
  } 
  else {
    console.log("React Dev Tools is not found")
    return;
  }
})();

//async version -- should we check for older browsers?!?!?! or use promises?!
async function getFiberDOM16(instance) {
  console.log("getFiberDOM16 is running")
  try {
    fiberDOM = await instance;
    currState = await checkReactDOM(fiberDOM);
    console.log(currState)
    // saveCache.addToHead(currState); move this step to devtools.js instead 
    transmitData(currState); 
  } catch (e) {
    console.log(e);
  }
}

async function getFiberDOM15() {
  console.log("getFiberDOM15 is running")
  try {
    currState = await parseData();
    console.log("Current State: ", currState);
    transmitData(currState);
    console.log('sent intial state the first time')
  } catch (e) {
    console.log(e);
  }
}


//parse data from React 15 
async function parseData(components = {}) {
  const root = reactInstance.Mount._instancesByReactRootID[1]._renderedComponent;
  traverseFifteen(root, components);
  // console.log(components)
  let data = {currentState: components};
  return data;
}

//traverse React 15 
function traverseFifteen(node, cache){
  let targetNode = node._currentElement;
  if (!targetNode) {
    return;
  }
  const component = {
    name: "",
    state: null, 
    props: null, 
    children: {},
  };

  if (targetNode.type) {
    if (targetNode.type.name) {
      component.name = targetNode.type.name;
    }
    else if (targetNode.type.displayName) {
      component.name = targetNode.type.displayName;
    }
    else {
      component.name = targetNode.type;
    }
  }

  //State 
  if (node._instance && node._instance.state) {
    component.state = node._instance.state;
    if (component.state === {}) {
      component.state = null;
    }
  }

  //props
  if (targetNode && targetNode.props) {
    let props = []; 
    if (typeof targetNode.props === 'object') {
      let keys = Object.keys(targetNode.props);
      keys.forEach((key) => {
        props.push(targetNode.props)
      });
      component.props = props;
    }
    else {
      component.props = targetNode.props;
    }
  }

  //store the objects to cache 

  if (node._debugID) {
    cache[node._debugID] = component;
  }
  if (node._domID && !cache[node._debugID]) {
    cache[node._domID] = component;
  }
  else if (!cache[node._debugID] && !cache[node._domID]){
    let mountOrder = node._mountOrder/10
    cache[mountOrder] = component
  }

  //entering the children components recursively 
  let children = node._renderedChildren
  component.children = {};
  if (children) {
    let keys = Object.keys(children);
    keys.forEach((key) => {
      traverseFifteen(children[key], component.children);
    })
  }
  else if (node._renderedComponent) {
    traverseFifteen(node._renderedComponent, component.children);
  }
};


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

//check if reactDOM is even valid and this is for React 16 or above
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
