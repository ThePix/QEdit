import React from 'react'
import { FormGroup, Message, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class ReadOnly extends React.Component {
  render() {
    const {item} = this.props

    return (
      <FormGroup style={{display:'flex'}}>
        <ControlLabel>{item.display}:</ControlLabel>
        <div style={{display:'flex'}}>
          <Message
            type="info"
            showIcon
            key={item.name}
            description={item.value}
            style={Constants.WIDECOMPONENT_STYLE}
          />
          {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
        </div>
      </FormGroup>
    )
  }
}
