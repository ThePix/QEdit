import React from 'react'
import Select from './select'
import * as Constants from '../constants'

const {lang} = require('../' + Constants.QUEST_JS_PATH + "lang/lang-en.js")

export default class SelectPronouns extends React.Component {
  render() {
    const data = Object.keys(lang.pronouns).map(o =>
      {return({value: o, label: o})})
    return (<Select {...this.props} data={data}/>)
  }
}
