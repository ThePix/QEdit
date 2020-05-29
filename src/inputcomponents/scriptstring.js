import React from 'react'
import { FormGroup, SelectPicker, ControlLabel, HelpBlock } from 'rsuite'
import AceEditor from "react-ace"
import * as Constants from '../constants'

// Fixes bug in ace-builds, where it can't find the worker
const ace = require('ace-builds/src-noconflict/ace')
ace.config.set("basePath", __dirname + "/../../node_modules/ace-builds/src-noconflict/")

const data = [
  Constants.MSG_OPTION,
  Constants.JS_OPTION,
  Constants.ASL_OPTION].map((s, i) => {return({value: s, label: s})})

export default class ScriptString extends React.Component {
/*  constructor(props) {
    super(props)
    this.handleChangeType = this.handleChangeType.bind(this)
  }

  handleChangeType(newValue) {
    const {objects, item} = this.props
    const type = {}

    switch (newValue) {
      case Constants.JS_OPTION:
        type.type = Constants.JS_TYPE
        break
      case Constants.ASL_OPTION:
        type.type = Constants.ASL_TYPE
        break
      case Constants.MSG_OPTION:
        type.type = Constants.MSG_TYPE
        break
    }

    objects.setScript(item.name, type)
  }
*/
  render() {
    const {item, objects} = this.props
    const value = objects.getValue(item.name) || item.default
    const {code} = value
    const type = value.type || Constants.DEFAULT_TYPE
    const option = Constants.SCRIPT_OPTION[type]
    const mode = Constants.SCRIPT_MODE[type]
/*
    var option, mode

    switch (type) {
      case Constants.JS_TYPE:
        option = Constants.JS_OPTION
        mode = Constants.JS_MODE
        break
      case Constants.ASL_TYPE:
        option = Constants.ASL_OPTION
        mode = Constants.ASL_MODE
        break
      case Constants.MSG_TYPE:
        option = Constants.MSG_OPTION
        mode = Constants.MSG_MODE
        break
    }
*/
    return (
      <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <SelectPicker
          key={item.name + '_option'}
          style={Constants.INPUTCOMPONENT_STYLE}
          data={data}
          defaultValue={option}
          onChange={(v) =>
            objects.setScript(item.name, {type:Constants.SCRIPT_TYPE[v]})}
          cleanable={false}
        />
        <br/>
        <AceEditor
          mode={mode}
          theme={Constants.ACETHEME}
          onChange={(v) => objects.setScript(item.name, {code:v})}
          name={item.name}
          editorProps={{ $blockScrolling: true }}
          value={code}
          style={Constants.ACE_STYLE}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
    )
  }
}
