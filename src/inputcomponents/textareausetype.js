import React from 'react'
import TextArea from './textarea'

export default class TextAreaUseType extends React.Component {
  render() {
    const {objects, item, usetype} = this.props
    const exit = objects.getExit(item.name)
    const value = exit ? exit.data[usetype] : ''
    return(
      <TextArea
        {...this.props}
        value={value}
        handleChange={(v) =>
          {if(value) objects.setExitData(item.name, {[usetype]: value})}}
        key={item.name + '_' + usetype}
      />
    )
  }
}
