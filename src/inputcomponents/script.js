import React from 'react'
import { FormGroup, ControlLabel, HelpBlock, Input } from 'rsuite'
import AceEditor from "react-ace"
import * as Constants from '../constants'

// Fixes bug in ace-builds, where it can't find the worker
const ace = require('ace-builds/src-noconflict/ace')
ace.config.set("basePath", __dirname + "/../../node_modules/ace-builds/src-noconflict/")

export default class Script extends React.Component {
  render() {
    const {item, objects} = this.props
    const value = objects.getValue(item.name) || item.default
    const {parameters, code} = value
    return (
      <div>
      <FormGroup>
        <ControlLabel>Parameters (separated with commas):</ControlLabel>
        <br/>
        <Input
          key={item.name + '_parameters'}
          style={Constants.INPUTCOMPONENT_STYLE}
          defaultValue={parameters}
          onChange={(v) =>
            objects.setScript(item.name, {type:Constants.JS_TYPE, parameters:v})}
        />
        </FormGroup>
        <FormGroup>
        <ControlLabel>{item.display}:</ControlLabel>
        <br/>
        <AceEditor
          mode={Constants.JS_MODE}
          theme={Constants.ACETHEME}
          onChange={(v) =>
            objects.setScript(item.name, {type: Constants.JS_TYPE, code:v})}
          name={item.name}
          editorProps={{ $blockScrolling: true }}
          value={code}
          style={Constants.ACE_STYLE}
        />
        {item.tooltip ? <HelpBlock tooltip>{item.tooltip}</HelpBlock> : ''}
      </FormGroup>
      </div>
    )
  }
}
