import React from 'react'
import Text from './text'
import * as Constants from '../constants'

export default class LongText extends React.Component {
  render() {
    return (
      <Text {...this.props} style={Constants.WIDECOMPONENT_STYLE}/>
    )
  }
}
