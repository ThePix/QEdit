import React from 'react'
import { Tree, Sidebar, Icon } from 'rsuite'
import * as Constants from './constants'

export default class SidePane extends React.Component {
  constructor(props) {
    super(props)
    this.onExpand = this.onExpand.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.renderTreeNode = this.renderTreeNode.bind(this)
  }

  componentDidMount() {
    this.props.objects.on(Constants.UPDATE_OBJECT_EVENT,
      () => {this.forceUpdate()})
  }

  componentWillUnmount() {
    this.props.objects.off(Constants.UPDATE_OBJECT_EVENT,
      () => {this.forceUpdate()})
  }

  onExpand(expandItemValues, activeNode, concat) {
    this.props.objects.toggleCollaps(activeNode.value, activeNode.expand)
  }

  onSelect(activeNode, value, event) {
    this.props.objects.setCurrentObjectByName(value)
  }

  renderTreeNode(nodeData) {
    const icon = Constants.OBJTYPE_ICONS[nodeData.type]
    return (
      <span>
        <Icon icon={icon}/> {nodeData.label}
      </span>
    )
  }
  // Add one item to the tree
  // Search this level, and recursively call this on lower levels
  addToTree(data, expand, obj) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].value === obj.loc) {
        data[i].children = data[i].children || []
        this.pushObject(data[i].children, expand, obj)
        return true
      }
      if (data[i].children) {
        if(this.addToTree(data[i].children, expand, obj)) return true
      }
    }
    return false
  }

  buildTree(data, expand, remainder, objects) {
    for (let i = 0; i < objects.length; i++) {
      if (!objects[i].loc) {
        this.pushObject(data, expand, objects[i])
      }
      else if (!this.addToTree(data, expand, objects[i])) {
        remainder.push(objects[i])
      }
    }
  }

  pushObject(data, expand, obj) {
    data.push({
      value: obj.name,
      label:obj.name,
      type: obj.jsObjType,
    })
    if (obj.jsCollapsed) expand.push(obj.name)
  }

  render() {
    const data = []
    const expand = []
    let objects = this.props.objects.getObjects()
    let remainder, count

    if (objects){
      do {
        remainder = []
        count = objects.length
        this.buildTree(data, expand, remainder, objects)
        objects = remainder
      } while (remainder.length !== 0 && remainder.length !== count)

      if (remainder.length !== 0) {
        console.log("WARNING: " + remainder.length + " items were not put in the tree.")
        console.log(remainder)
      }
    }
// TODO: Implement draggable
// TODO: Insert a search field on top of tree
    return (
      <Sidebar
        width={Constants.SIDEBARWIDTH}
        style={Constants.MAINCONTAINER_STYLE}
      >
        <Tree
          data={data}
          draggable
          defaultExpandItemValues={expand}
          onExpand={this.onExpand}
          onSelect={this.onSelect}
          renderTreeNode={this.renderTreeNode}
        />
      </Sidebar>
    )
  }
}
