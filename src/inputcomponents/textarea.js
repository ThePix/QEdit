import React from 'react'
import { FormGroup, Input, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class TextArea extends React.Component {
  render() {
    const {item, value, handleChange, style, objects} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultHandleChange = (value) => objects.setValue(item.name, value)

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <Input
          key={item.name}
          defaultValue={value ? value : defaultValue}
          onChange={handleChange ? handleChange : defaultHandleChange}
          componentClass="textarea"
          rows={5}
          style={style ? style : Constants.WIDECOMPONENT_STYLE}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
