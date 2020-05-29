import React from 'react'
import AceEditor from "react-ace"
//const Blockly = require('node-blockly/javascript');

const TEXT_OPTION = 'Text'
const TEXT_MODE = 'text'
const TEXT_TYPE = 'string'
const JS_OPTION = 'JavaScript'
const JS_MODE = 'javascript'
const JS_TYPE = 'js'
const ASL_OPTION = 'ASL'
const ASL_MODE = 'text'
const ASL_TYPE = 'script'
const DEFUALT_OPTION = TEXT_OPTION
const DEFUALT_MODE = TEXT_MODE
const DEFUALT_TYPE = TEXT_TYPE

// Fixes bug in ace-builds, where it can't find the worker
const ace = require('ace-builds/src-noconflict/ace')
ace.config.set("basePath", __dirname + "/../node_modules/ace-builds/src-noconflict/")

console.log("blockly loaded okay")

// The input should (or might) specify:
//    if a string is allowed
//    return type
//    parameters
// The value should be a dictionary, with type and code attributes

export class ScriptOrStringComp extends React.Component {
  // This handles changing the type
  onChangeType(newValue) {
    var code = (this.props.value.code) ? this.props.value.code : this.props.value
    var value = {}

    switch (newValue.target.value) {
      case JS_OPTION:
        value.type = JS_TYPE
        value.code = code
        break
      case ASL_OPTION:
        value.type = ASL_TYPE
        value.code = code
        break
      case TEXT_OPTION:
        value = code
        break
    }

    newValue.target = Object.assign({}, newValue.target, {id:this.props.input.name, value:value})
    newValue.target.dataset = Object.assign({}, newValue.target.dataset, {type: 'scriptType'})
    this.props.handleChange(newValue)
  }

  // This handles changing the code
  onChangeCode(newValue) {
    var value = {}

    switch (this.props.value.type) {
      case JS_TYPE:
        value.type = this.props.value.type
        value.code = newValue
        break
      case ASL_TYPE:
        value.type = this.props.value.type
        value.code = newValue
        break
      //TEXT_TYPE
      default:
        value = newValue
        break
    }

    const e = {target:{id:this.props.input.name, value:value, dataset:{type: 'scriptChange'}}}
    this.props.handleChange(e)
  }

  render() {
    var typevalue = ''
    var mode = ''
    var codevalue = (this.props.value.type) ? this.props.value.code : this.props.value
    switch ((this.props.value.type) ? this.props.value.type : DEFUALT_TYPE) {
      case JS_TYPE:
        typevalue = JS_OPTION
        mode = JS_MODE
        break
      case ASL_TYPE:
        typevalue = ASL_OPTION
        mode = ASL_MODE
        break
      case TEXT_TYPE:
        typevalue = TEXT_OPTION
        mode = TEXT_MODE
        break
    }

    return (
      <tr className="form-group">
        <td colSpan="2">
          <span className="fieldName">{this.props.input.display}</span>
          <span style={{textAlign:'right'}}>
          <select
            className="form-control"
            id={this.props.input.name}
            name={this.props.input.name}
            value={typevalue}
            title={this.props.tooltip}
            onChange={this.onChangeType.bind(this)}
          >
            {[TEXT_OPTION, JS_OPTION, ASL_OPTION].map((s, i) => <option value={s} key={i}>{s}</option>)}
          </select>
          </span>

          <br/>
          <AceEditor
            mode={mode}
            theme="kuroir"
            onChange={this.onChangeCode.bind(this)}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            value={codevalue}
            width='100%'
          />
        </td>
      </tr>
    )
  }
}

class ScriptComp extends React.Component {
  // This handles changing the code
  onChangeCode(newValue) {
    const value = {type:JS_TYPE, params:this.props.value.params ,code:newValue}
    const e = {target:{id:this.props.input.name, value:value}}
    this.props.handleChange(e)
  }

  // This handles changing the parameters
  onChangeParams(newValue) {
    const value = {type:JS_TYPE, params:newValue.target.value ,code:this.props.value.code}
    const e = {target:{id:this.props.input.name, value:value}}
    this.handleChange(e)
  }

  render() {
    return (
      <div style={style}>
        <span className="fieldName">Parameters (separated with commas)</span>
        <input
          className="form-control"
          id={this.props.input.name}
          name={this.props.input.name}
          type={this.props.input.type}
          title={this.props.input.tooltip}
          value={this.props.value.params}
          onChange={this.onChangeParams.bind(this)}
        />
        <br/>
        <AceEditor
          mode={JS_MODE}
          theme="kuroir"
          onChange={this.onChangeCode.bind(this)}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          value={this.props.value.code}
          width='100%'
        />
      </div>
    )
  }
}
