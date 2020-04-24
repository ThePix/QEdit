import React, {Component} from 'react'
import {Treebeard, decorators, theme} from 'react-treebeard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Constants from './constants'

const data = []

const {tree} = theme
tree.base.backgroundColor = '#EEF'
tree.node.activeLink.background = 'yellow'
tree.base.color = 'black'
tree.node.toggle.arrow.fill = 'black'
tree.node.header.base.color = 'black'

export class SidePane extends Component {
  constructor(props){
    super(props)
    this.state = {data}
    this.onToggle = this.onToggle.bind(this)
//    props.objects.on('Update', () => {this.forceUpdate()})
  }

  onToggle(node, toggled){
    const {cursor, data} = this.state
    let toggle = (node.children) ? true : false
    if (cursor) {
        cursor.active = false
        this.setState(() => ({cursor, data}))
        toggle = (node.name === cursor.name && toggle) ? true : false
    }
    else {
      toggle = false
    }

    node.active = true
    this.props.objects.setCurrentObjectByName(node.name)
    if (toggle) {
        node.toggled = toggled
        this.props.objects.toggleCollaps(node.name, toggled)
    }

    this.setState(() => ({cursor: node, data: Object.assign({}, data)}))
  }

  // Add one item to the tree
  // Search this level, and recursively call this on lower levels
  addToTree(data, obj) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === obj.loc) {
        data[i].children = data[i].children || []
        this.pushObject(data[i].children, obj)
        return true
      }
      if (data[i].children) {
        if(this.addToTree(data[i].children, obj)) return true
      }
    }
    return false
  }

  buildTree(remainder, objects) {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].loc === undefined || objects[i].loc === "---") {
        this.pushObject(data, objects[i])
      }
      else if (!this.addToTree(data, objects[i])) {
        remainder.push(objects[i])
      }
    }
  }

  pushObject(data, obj) {
    data.push({name:obj.name,
      toggled: (obj.jsCollapsed) ? false : true,
      active: (this.props.objects.getCurrentObject() === obj) ? true : false,
      type: obj.jsObjType,
    })
  }

  render() {
    data.length = 0
    let objects = this.props.objects.getObjects()
    let remainder
    let count

    if (objects){
      do {
        remainder = []
        count = objects.length
        this.buildTree(remainder, objects)
        objects = remainder
      } while (remainder.length !== 0 && remainder.length !== count)

      if (remainder.length !== 0) {
        console.log("WARNING: " + remainder.length + " items were not put in the tree.")
        console.log(remainder)
      }
    }

    return (<div id="sidepane"><Treebeard
      data={data}
      onToggle={this.onToggle}
      decorators={Object.assign({}, decorators, {Header:Header})}
      style={{tree}}
    /></div>)
  }
}

const Header = ({style, node}) => {
  const iconStyle = {marginRight: '5px'}
  let iconType = 'file-alt'
  switch(node.type) {
    case Constants.SETTINGS_TYPE:
      iconType = Constants.ICON_SETTINGS
      break
    case Constants.ROOM_TYPE:
      iconType = Constants.ICON_ROOM
      break
    case Constants.ITEM_TYPE:
      iconType = Constants.ICON_ITEM
      break
    case Constants.STUB_TYPE:
      iconType = Constants.ICON_STUB
      break
    case Constants.FUNCTION_TYPE:
      iconType = Constants.ICON_FUNCTION
      break
    case Constants.COMMAND_TYPE:
      iconType = Constants.ICON_COMMAND
      break
    case Constants.TEMPLATE_TYPE:
      iconType = Constants.ICON_TEMPLATE
      break
  }

  return (
    <div style={style.base}>
      <div style={style.title}>
        <i style={iconStyle}>
          <FontAwesomeIcon icon={iconType}/>
        </i>
        {node.name}
      </div>
    </div>
  )
}
