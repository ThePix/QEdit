import React from 'react'
import Select from './select'

export default class SelectExit extends React.Component {
  constructor(props) {
      super(props)
      this.handleChange = this.handleChange.bind(this)
  }
  handleChange(value) {
    const {objects, item} = this.props
    if(value) objects.setExitData(item.name, {name:value})
    else objects.deleteExit(item.name)
  }

  render() {
    const {objects, item} = this.props
    const data = objects.getObjectOnlyNames().map(o =>
      {return({value: o, label: o})})
    const exit = objects.getExit(item.name)
    const value = exit ? exit.data.name : ''
    return (
      <Select {...this.props}
        data={data}
        handleChange={this.handleChange}
        value={value}
        cleanable={true}
      />
    )
  }
}
