import React from 'react';



export class SidePane extends React.Component {
  render() {
    const {objects,  addObject, showObject} = this.props;
    
    return (<div id="sidepane">
      <div className="newButtonDiv"><button onClick={() => addObject()} type="button">New object</button></div>
      <ObjectList objects={objects} showObject={showObject}/>
    </div>);
  }
}


export class ObjectList extends React.Component {
  addToTree(tree, obj) {
    //console.log("Looking for " + obj.loc + " in " + console.log(JSON.stringify(tree)));
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].name === obj.loc) {
        const h = {name:obj.name, object:obj, branch:[]};
        tree[i].branch.push(h);
        return true;
      }
      if (this.addToTree(tree[i].branch, obj)) {
        return true;
      }
    }
    console.log("Failed to put in tree: " + obj.name);
  }  
  
  render() {
    const tree = [];
    
    for (let i = 0; i < this.props.objects.length; i++) {
      if (this.props.objects[i].loc === undefined || this.props.objects[i].loc === "---") {
        tree.push({name:this.props.objects[i].name, object:this.props.objects[i], branch:[]});
      }
      else {
        this.addToTree(tree, this.props.objects[i]);
      }
    }
    //console.log(JSON.stringify(tree));
    
    return <TreeView tree={tree} showObject={this.props.showObject}/>
    //return null;
  }
}



export class TreeView extends React.Component {
  render() {
    const {tree, showObject} = this.props;

    if (tree.length === 0) return null;
    return (<ul className="active">
    {tree.map(function(node, index) {
      if (node.branch.length === 0) {
        return (<li key={index}>
          {String.fromCharCode(9678)}
          <TreeLink object={node.object} showObject={showObject}/>
        </li>)
      }
      else {
        //return null;
        return (<TreeToggler tree={node} key={index} showObject={showObject}/>)
      }
    })}
    </ul>)
  }
}


export class TreeToggler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded:true,
    }
  }
  
  toggler() {
    this.setState({
      expanded:!this.state.expanded,
    });
  }

  render() {
    const {tree, showObject} = this.props;
    if (this.state.expanded) {
      return (<li>
        <a onClick={this.toggler.bind(this)} className="caret">{String.fromCharCode(9660)}</a>
        <TreeLink object={tree.object} showObject={showObject}/>
        <TreeView tree={tree.branch} showObject={showObject}/>
      </li>)
    }
    else {
      return (<li>
        <a onClick={this.toggler.bind(this)} className="caret">{String.fromCharCode(9654)}</a>
        <TreeLink object={tree.object} showObject={showObject}/>
      </li>)
    }      
  }
}


const TreeLink = (props) => {
  const {object, showObject} = props;
  console.log(object);
  console.log(object.name);
  console.log(object.jsIsRoom);
  return  <a onClick={() => props.showObject(props.object.name)} className={object.jsIsRoom ? "treeRoom" : "treeItem"}>{props.object.name}</a>
}