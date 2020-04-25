import React from 'react'
import {ExitsComp} from './exitscomp'
import {ScriptOrStringComp} from './scriptorstringcomp'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {ScriptComp, SelectComp, TickComp} from './components'
import * as Constants from './constants'

const useWithDoor = function() {};

console.log("About to...3")
const {lang} = require(Constants.QUEST_JS_PATH + "lang/lang-en.js")
console.log("... done")


var tabs = []
var tabPanels = []

export class MainPane extends React.Component {
  constructor(props) {
    super(props)
    props.objects.on(Constants.UPDATE_OBJECT_EVENT, () => {this.forceUpdate()})
  }

  updateTabs () {
    const controls = []

    for (let i = 0; i < this.props.objects.controls.length; i++) {
      if (this.props.objects.displayIf(this.props.objects.controls[i])) {
        controls.push(this.props.objects.controls[i])
      }
    }

    tabs = controls.map((item, i) =>
      <Tab key={item.tabName}>{item.tabName}</Tab>
    )

    tabPanels = controls.map((item, i) =>
      <TabPanel key={item.tabName}>
        <TabComp
          objects={this.props.objects}
          handleChange={this.props.handleChange}
          handleIntChange={this.props.handleIntChange}
          handleListChange={this.props.handleListChange}
          handleCBChange={this.props.handleCBChange}
          controls={item.tabControls}
          options={this.props.options}/>
      </TabPanel>
    )
  }

  render() {
    const current = this.props.objects.getCurrentObject()
    if (current) {
      const pStyle = {
//        color:this.props.object.uiColour(this.props.options.darkMode),
        padding:3,
      }
      // TODO: This takes forever with many objects, either do it async or only check when user is changing name
      if (this.props.objects.isInvalidName()) pStyle.backgroundColor = 'yellow'

      // Will later need to check if this object has the current tab and set tab to zero if not
      const deleteLink = (current.jsObjType === Constants.SETTINGS_TYPE ? '' : <a onClick={() => this.props.objects.removeObject(current.name)} className="deleteLink">(delete)</a>)

      const title = (current.jsObjType === Constants.SETTINGS_TYPE ?
        <b><i>Editing Settings</i></b> :
        <b><i>Editing {current.jsObjType === Constants.ROOM_TYPE ? "Location" : "Item"}:</i> <span style={{color:current.jsColour}}>{current.name}</span></b>
      )

      this.updateTabs()
      return (<div id="mainpane">
        <p style={pStyle}>
          <b>{title}</b>
          {deleteLink}
        </p>
        <Tabs>
          <TabList>
            {tabs}
          </TabList>
          {tabPanels}
        </Tabs>
      </div>)
    }
    else {
      //this.state = {};
      return (<div id="mainpane">
        <h2>Welcome!</h2>
      </div>)
    }
  }
}






const TabComp = (props) => {
  const controls = props.controls//.filter(el => el.tab == props.tab);  // double equals not triple!
  if (controls[0].name === "exits") {
    return (
      <div className="tabContent">
      <ExitsComp handleChange={props.handleChange} objects={props.objects} options={props.options}/>
      </div>
    )
  }
  else {
    return (
      <div className="tabContent">
      <table><tbody>
        {controls.map((item, i) => <InputComp
          handleChange={props.handleChange}
          handleIntChange={props.handleIntChange}
          handleListChange={props.handleListChange}
          handleCBChange={props.handleCBChange}
          input={item}
          key={i}
          objects={props.objects} />
      )}
      </tbody></table>
      </div>
    )
  }
}





const InputComp = (props) => {
  if (!props.objects.displayIf(props.input)) return null;

  let value = props.objects.getCurrentObject()[props.input.name]
  const usingDefault = (value === undefined)
  if (value === undefined) value = props.input.default
  if (props.input.type === "select") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} options={props.input.options} tooltip={props.input.tooltip} usingDefault={usingDefault} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    )
  }
  else if (props.input.type === "selectpronouns") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} options={Object.keys(lang.pronouns)} tooltip={props.input.tooltip} usingDefault={usingDefault} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    );
  }
  else if (props.input.type === "objects") {
    const options = ["---"].concat(props.objects.getObjectOnlyNames())
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} options={options} tooltip={props.input.tooltip} usingDefault={usingDefault} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    );
  }
  else if (props.input.type === "otherobjects") {
    const options = ["---"].concat(props.objects.getOtherObjectOnlyNames())
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} options={options} tooltip={props.input.tooltip} usingDefault={usingDefault} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    );
  }
  else if (props.input.type === "flag") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><TickComp name={props.input.name} options={Object.keys(lang.pronouns)} tooltip={props.input.tooltip} usingDefault={usingDefault} handleChange={props.handleCBChange} value={value}/></td>
      </tr>
    )
  }
  else if (props.input.type === "todolist") {
    return (
      <tr className="form-group">
        <td colSpan="2">
        <br/>
        These issues were identified when this game was converted from Quest 5. Click
        <a onClick={() => props.objects.removeConversionNotes()} className="stdLink"> here </a>
        when you are certain they are resolved to delete the whole list.
        <br/>
        <ul>
          {value.map((x, index) => {
            return <li key={index}>{x}</li>
          })}
        </ul>
        </td>
      </tr>
    )
  }
  else if (props.input.type === "textarea") {
    return (
      <tr className="form-group">
        <td colSpan="2"><span className="fieldName">{props.input.display}</span>
        <br/>
        <textarea
          className="form-control textarea"
          cols="500" rows="8"
          id={props.input.name}
          name={props.input.name}
          data-usingdefault={usingDefault}
          value={value}
          title={props.input.tooltip}
          onChange={props.handleChange}
        /></td>
      </tr>
    )
  }
  else if (props.input.type === "title") {
    return (
      <tr className="form-group">
        <td colSpan="2">
          <span className="fieldTitle">{props.input.display}</span>
        </td>
      </tr>
    )
  }
  else if (props.input.type === "scriptstring") {
    return (
      <ScriptOrStringComp input={props.input} value={value} handleChange={props.handleChange} allowString={true}/>
    )
  }
  else if (props.input.type === "script") {
    return (
      <ScriptOrStringComp input={props.input} value={value} handleChange={props.handleChange} allowString={false}/>
    )
  }
  else if (props.input.type === "stringlist") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <textarea
            className="form-control stringlist"
            cols="40" rows="6"
            id={props.input.name}
            name={props.input.name}
            data-usingdefault={usingDefault}
            value={value.join('\n')}
            data-type="stringlist"
            title={props.input.tooltip + " Each entry in the list should be on a line on its own; press Enter to go to the next entry."}
            onChange={props.handleListChange}
          />
        </td>
      </tr>
    )
  }
  else if (props.input.type === "readonly") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><span className="fieldName" title={props.input.tooltip}>{value}</span></td>
      </tr>
    )
  }
  else if (props.input.type === "text" || props.input.type === "string" || props.input.type === "regex") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type={props.input.type}
          title={props.input.tooltip}
          data-usingdefault={usingDefault}
          value={value}
          onChange={props.handleChange}
        /></td>
      </tr>
    )
  }/*
  else if (props.input.type === "id") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type={props.input.type}
          title={props.input.tooltip}
          data-usingdefault={usingDefault}
          value={value}
          onChange={props.handleIdChange}
        /></td>
      </tr>
    )
  }*/
  else if (props.input.type === "longtext" || props.input.type === "longstring") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type={props.input.type}
          size="60"
          title={props.input.tooltip}
          data-usingdefault={usingDefault}
          value={value}
          onChange={props.handleChange}
        /></td>
      </tr>
    )
  }
  else if (props.input.type === "int") {
    if (typeof value === 'string') value = parseInt(value)
    if (typeof value !== 'number') {
      console.log("Warning: Not an integer - " + props.input.name)
      console.log(value)
    }
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type="number"
          size="2"
          min={props.input.min}
          max={props.input.max}
          data-usingdefault={usingDefault}
          title={props.input.tooltip}
          value={value}
          onChange={props.handleIntChange}
        /></td>
      </tr>
    )
  }
  else {
    console.log("Type not recognised: " + props.input.type);
    return null;
  }
}
