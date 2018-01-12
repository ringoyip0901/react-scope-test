//branch1
const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
const reactInstance = reactInstances[Object.keys(reactInstances)[0]];
const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
let reactDOM;

devTools.onCommitFiberRoot = (function (original) {
  return function(...args) {
      reactDOM = args[1];
		tester();
		checkingReactDOM();
    return original(...args);
  }
})(devTools.onCommitFiberRoot);

//async version -- should we check for older browsers?!?!?! or use promises?! Ask Jon.
async function tester () {
  try {
    var state = await reactDOM.current.stateNode.current.child.memoizedState;
  } catch(e) {
    console.log('error: ' + e);
  }
  for (let key in state) {
    if (state[key].constructor === Array) {
      let arr = state[key];
      for (let i = 0; i < arr.length; i++) {
        // console.log(arr[i]);
    }
    }
  }
}

//getting State and Props
async function getStateProps() {
	let parent = reactDOM.current;
	console.log(parent)
	let sheet = {}; 
	while (parent.child.alternate !== null) {
		let component = parent.child; 
		sheet[component.type.name || component.type.displayName|| "Stateless Component"] = {
			'name': component.type.name || component.type.displayName || "stateless component",
			'State': component.memoizedState || "No state",
			'Props': component.memoizedProps || "No Props"
		}
		parent = parent.child;
	}
	console.log(sheet)
	return;
}



//check if reactDOM is even valid 

const traverseComp = function (node, cache) {

	const component = {
		name: "", 
		state: null, 
		props: null, 
		children: {}, 
	};

	//consider using switch/case 
	if (node.type) {
		if (node.type.name) {
			component.name = node.type.name;
		}
		else {
			component[name] = node.type;
		}
	}

	if (node.memoizedState) {
		component.state = node.memoizedState;
	}

	if (node.memoizedProps) {
		component.props = node.memoizedProps;
	}
	
	if (node._debugID) {
		cache[node._debugID] = component
	}
	else if (!node._debugID) {
		cache["Default ID"] = component
	}

	if (node.child !== null) {
		traverseComp(node.child, component.children)
	}
	if (node.sibling !== null) {
		traverseComp(node.sibling, component.children)
	}
}

async function checkingReactDOM() {
	let store = {currentState: null};
	let cache = {};
	if (reactDOM) {
		console.log(reactDOM.current)
		traverseComp(reactDOM.current, cache); //maybe there is no need to use stateNode.current
	}
	else {
		return;
	}
	store.currentState = cache
	console.log("Store with Hierarchy: ", store)
	// console.log("Hierarchy: ", cache)
}
