import React from 'react'
import { FormGroup, InputNumber, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class Int extends React.Component {
  render() {
    const {item, value, handleChange, style, objects} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultHandleChange = (value) => objects.setValue(item.name, value)

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <InputNumber
          key={item.name}
          style={style ? style : Constants.INPUTCOMPONENT_STYLE}
          defaultValue={value ? value : defaultValue}
          min={item.min}
          max={item.max}
          onChange={handleChange ? handleChange : defaultHandleChange}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
