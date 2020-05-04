import React from 'react'
import Text from './text'

export default class TextDoor extends React.Component {
  render() {
    const {objects, item} = this.props
    const exit = objects.getExit(item.name)
    const value = exit ? exit.data.doorName : ''

    return(
      <Text
        {...this.props}
        value={value}
        handleChange={(v) => objects.setExitData(item.name, {doorName:v})}
        key={item.name + '_doorName'}
      />
    )
  }
}
