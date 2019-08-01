import React from 'react';



export class SidePane extends React.Component {
  // Add one item to the tree
  // Search this level, and recursively call this on lower levels
  addToTree(tree, obj) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].name === obj.loc) {
        // Found on this level, add new node and quit
        const h = {name:obj.name, object:obj, branch:[]};
        tree[i].branch.push(h);
        return true;
      }
      if (this.addToTree(tree[i].branch, obj)) {
        // Found on a lower level, so it was added there
        return true;
      }
    }
    return false;
  }
  
  buildTree(tree, remainder, objects) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].loc === undefined || objects[i].loc === "---") {
        tree.push({name:objects[i].name, object:objects[i], branch:[]});
      }
      else {
        if (!this.addToTree(tree, objects[i])) remainder.push(objects[i]);
      }
    }
  }
  
  render() {
    const tree = [];
    let objects = this.props.objects
    let remainder;
    let count;
    
    do {
      remainder = [];
      count = objects.length;
      this.buildTree(tree, remainder, objects);
      objects = remainder;
    } while (remainder.length !== 0 && remainder.length !== count);

    if (remainder.length !== 0) {
      console.log("WARNING: " + remainder.length + " items were not put in the tree.")
      console.log(remainder);
    }
    
    return <div id="sidepane"><TreeView tree={tree} selected={this.props.object} showObject={this.props.showObject} treeToggle={this.props.treeToggle}/></div>
  }
}

const TreeView = (props) => {
  const {tree, showObject, treeToggle} = props;

  if (tree.length === 0) return null;
  return (<ul className="active sidepane">
  {tree.map(function(node, index) {
    if (node.branch.length === 0) {
      return (<li key={index}>
        {String.fromCharCode(9678)}
        <TreeLink object={node.object} showObject={showObject} selected={props.selected}/>
      </li>)
    }
    else {
      return (<TreeToggler tree={node} key={index} showObject={showObject} treeToggle={treeToggle} selected={props.selected}/>)
    }
  })}
  </ul>)
}

const TreeToggler = (props) => {
  const {tree, showObject, treeToggle} = props;
  
  if (tree.object.jsExpanded) {
    return (<li>
      <a onClick={() => treeToggle(tree.object)} className="caret">{String.fromCharCode(9660)}</a>
      <TreeLink object={tree.object} showObject={showObject} selected={props.selected}/>
      <TreeView tree={tree.branch} showObject={showObject} treeToggle={treeToggle} selected={props.selected}/>
    </li>)
  }
  else {
    return (<li>
      <a onClick={() => treeToggle(tree.object)} className="caret">{String.fromCharCode(9654)}</a>
      <TreeLink object={tree.object} showObject={showObject} selected={props.selected}/>
    </li>)
  }      
}



const TreeLink = (props) => {
  const {object, showObject} = props;
  let className = "tree " + object.treeStyleClass();
  if (object === props.selected) className += " treeSelected";
  
  return  <a onClick={() => showObject(object.name)} className={className}>{object.name}</a>
}