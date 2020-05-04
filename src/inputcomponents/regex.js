import React from 'react'
import Text from './text'
import * as Constants from '../constants'

const errorStyle = {
  backgroundColor: 'red',
  borderColor: 'red'
}

export default class Regex extends React.Component {
  constructor(props) {
    super(props)
    this.style = Constants.INPUTCOMPONENT_STYLE
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(value) {
    const {objects, item} = this.props

    try {
      new RegExp(value)
      this.style = Constants.INPUTCOMPONENT_STYLE
    } catch(e) {
      this.style = Object.assign({}, Constants.INPUTCOMPONENT_STYLE, errorStyle)
    }

    objects.setValue(item.name, value)
  }

  render() {
    return(
      <Text {...this.props} handleChange={this.handleChange} style={this.style}/>
    )
  }
}
