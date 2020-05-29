import React from 'react'
import Select from './select'

export default class SelectDoor extends React.Component {
  render() {
    const {objects, item} = this.props
    const data = objects.getOtherObjectOnlyNames().map(o =>
      {return({value: o, label: o})})
    const exit = objects.getExit(item.name)
    const value = exit ? exit.data.door : ''
    return (
      <Select {...this.props}
        data={data}
        handleChange={(value) => objects.setExitData(item.name, {door:value})}
        value={value}
        cleanable={true}
      />
    )
  }
}
