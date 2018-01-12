//branch1
const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
const reactInstance = reactInstances[Object.keys(reactInstances)[0]];
const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
let reactDOM;

devTools.onCommitFiberRoot = (function (original) {
  return function(...args) {
      reactDOM = args[1];
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

const traverseComp = function (node, cache) {

	//LinkedList Style
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
			component.name = node.type || "Default";
		}
	}

	if (node.memoizedState) {
		component.state = node.memoizedState;
	}

	if (node.memoizedProps) {
		let props = [];
		if (typeof node.memoizedProps === "object") {
			let keys = Object.keys(node.memoizedProps);
			keys.forEach((key) => {
				props.push(node.memoizedProps[key])
			})
			component.props = props[0] || props; //need to parse the props if it is a function or an array or an object
		}
		else {
			component.props = node.memoizedProps
		}
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

//check if reactDOM is even valid 
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
}
