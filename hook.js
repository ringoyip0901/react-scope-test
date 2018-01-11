// //props
// devTools.onCommitFiberRoot = (function(original) {
// 	return function(...args) {
// 		reactDOM = args[1];
// 		let running;
// 		tester()
// 		return original(...args);
// 	}
// })(devTools.onCommitFiberRoot);

// function tester() {
// 	let running; 
// 	if (!running) {
// 		running = true;
// 		console.log(reactDOM.current)
// 		// console.log(reactDOM.current.child.child.memoizedProps.children[0].props)
// 	}
// }


///GET State 
const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
const reactInstance = reactInstances[Object.keys(reactInstances)[0]];
const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
// alert(JSON.stringify(reactInstance));
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

// ORIGINAL
// async function getStateProps() {
// 	let running; 
// 	if (!running) {
// 		running = true;
// 		console.log(reactDOM.current)
// 		//name of the top 
// 		let component = reactDOM.current.child
// 		console.log(component.type.name) //Container 
// 		//get State 
// 		let state = reactDOM.current.child.memoizedState;
// 		console.log("State: ", state);

// 		//check if the compnent has a child, and find the name 
// 		//get props 
// 		console.log("Child");
// 		if (component.child.type) {
// 			let childComponent = component.child;
// 			let componentProps = childComponent.memoizedProps.children;
// 			for (let i = 0; i < componentProps.length; i++) {
// 				console.log("Props: ", componentProps[i].props)
// 			}
// 		}
// 		// console.log(reactDOM.current.child.child.type.name)
// 		// console.log(reactDOM.current.child.child.memoizedProps.children[0].props)
// 	}
// }

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

const traverseComp = function (node, parentArray) {

	const newComponent = {
		name: "", 
		state: null, 
		props: null, 
		id: null, 
		children: [], 
		isDOM: null,
	};

	if (node._debugID) {
		newComponent.id = node._debugID;
	}

	if (node.type) {
		if (node.type.name) {
			newComponent.name = node.type.name;
			newComponent.isDOM = false;
		}
		else if (node.type) {
			newComponent[name] = node.type;
			newComponent.isDOM = true;
		}
	}

	if (node.memoizedState) {
		newComponent.state = node.memoizedState;
	}

	if (node.memoizedProps) {
		newComponent.props = node.memoizedProps;
	}


	// if (node.type && node.type.propTypes) {
		
	// }
	
	parentArray.push(newComponent);

	newComponent.children = [];
	if (node.child !== null) {
		traverseComp(node.child, newComponent.children)
	}
	if (node.sibling !== null) {
		traverseComp(node.sibling, newComponent.children)
	}
}

async function checkingReactDOM() {
	let components = [];
	if (reactDOM) {
		console.log(reactDOM.current)
		// traverseComp(reactDOM.current.stateNode.current, components);
		traverseComp(reactDOM.current, components); //maybe there is no need to use stateNode.current

	}
	else {
		return;
	}
	console.log("Hierachy: ", components)
}
