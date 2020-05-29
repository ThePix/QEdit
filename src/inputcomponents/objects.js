import React from 'react'
import { FormGroup, SelectPicker, ControlLabel, HelpBlock } from 'rsuite'
import * as Constants from '../constants'

export default class Objects extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(value) {
    const {objects, item} = this.props
    const current = objects.getCurrentObject()
    if (value) {
      let object = objects.getObjectByName(value)
      let child
      while (object.loc !== undefined && object.loc !== '') {
        if (object.loc === current.name) {
          object.loc = current.loc
          break
        }
        object = objects.getObjectByName(object.loc)
      }
    }
    objects.setValue(item.name, value)
  }

  render() {
    const {item, value, handleChange, style, data, objects, cleanable} = this.props
    const defaultValue = objects.getValue(item.name) || item.default
    const defaultData = objects.getObjectOnlyNames().map(o =>
      {return({value: o, label: o})})

    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <SelectPicker
          key={item.name}
          style={style ? style : Constants.INPUTCOMPONENT_STYLE}
          data={data ? data : defaultData}
          defaultValue={value ? value : defaultValue}
          onChange={handleChange ? handleChange : this.handleChange}
          cleanable={cleanable ? cleanable : true}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
