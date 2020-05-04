import React from 'react'
import { FormGroup, Divider } from 'rsuite'

export default class Title extends React.Component {
  render() {
    const item = this.props.item

    return (<FormGroup><h5>{item.display}</h5><Divider /></FormGroup>)
  }
}
