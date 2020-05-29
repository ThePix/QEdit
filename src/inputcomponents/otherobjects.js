import React from 'react'
import Objects from './objects'

export default class OtherObjects extends React.Component {
  render() {
    const data = this.props.objects.getOtherObjectOnlyNames().map(o =>
      {return({value: o, label: o})})

    return (<Objects {...this.props} data={data}/>)
  }
}
