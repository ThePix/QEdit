import React from 'react'
import { FormGroup, Input, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class Text extends React.Component {
  render() {
    const {item, value, handleChange, style, objects} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultHandleChange = (value) => objects.setValue(item.name, value)

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <Input
          key={item.name}
          style={style ? style : Constants.INPUTCOMPONENT_STYLE}
          defaultValue={value ? value : defaultValue}
          onChange={handleChange ? handleChange : defaultHandleChange}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
