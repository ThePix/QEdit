import React from 'react'
import { FormGroup, Toggle, ControlLabel, HelpBlock } from 'rsuite'

export default class Flag extends React.Component {
  render() {
    const {item, value, objects, handleChange} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultHandleChange = (value) => objects.setValue(item.name, value)

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <Toggle
          key={item.name}
          defaultChecked={value ? value : defaultValue}
          onChange={handleChange ? handleChange : defaultHandleChange}
          style={{marginTop:5}}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
