import React from 'react'
import { FormGroup, SelectPicker, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class Select extends React.Component {
  render() {
    const {item, objects, handleChange, data, value, cleanable} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultHandleChange = (value) => objects.setValue(item.name, value)
    const defaultData = (item.options) ?
      item.options.map(o => {return({value: o, label: o})}) : []

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <SelectPicker
          key={item.name}
          style={Constants.INPUTCOMPONENT_STYLE}
          data={data ? data : defaultData}
          defaultValue={value ? value : defaultValue}
          onChange={handleChange ? handleChange :defaultHandleChange}
          cleanable={cleanable ? cleanable : false}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
