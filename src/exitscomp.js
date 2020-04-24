import React from 'react';
import {ScriptComp, SelectComp} from './components';
import * as Constants from './constants'

console.log("About to...2")
const {lang} = require(Constants.QUEST_JS_PATH + "lang/lang-en.js")
//const useWithDoor = function() {};



export class ExitsComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected:null,
    }
  }

  handleSelectExit(dir) {
    this.setState({
      selected:dir,
    });
  }

  render() {
    const data = []
    for (let row = 0; row < 3; row++) {
      data.push(<ExitsRow row={row} key={row} object={this.props.objects.getCurrentObject()} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>)
    }

    return(<div>
      <table width="90%"><tbody>
      {data}
      </tbody></table>
      <br/>
      <br/>
      <ExitDetails objects={this.props.objects} options={this.props.options} selected={this.state.selected} handleChange={this.props.handleChange} />
    </div>)
  }
}


const ExitsRow = (props) => {
  const data = []

  for (let col = 0; col < 5; col++) {
    if (lang.exit_list[col + 5 * props.row].nocmd) {
      data.push(<td key={col + 5 * props.row}>&nbsp;</td>)
    }
    else {
      data.push(<Exit name={lang.exit_list[col + 5 * props.row].name} key={col + 5 * props.row} object={props.object} selected={props.selected} handleSelectExit={props.handleSelectExit}/>)
    }
  }

  return (
    <tr>
    {data}
    </tr>
  )
}



const Exit = (props) => {
  const ex = props.object[props.name]
  const selected = (props.selected === props.name)
  const style = {border:"black solid 1px", backgroundColor:selected ? "yellow" : "#ffb", cursor:"pointer",textAlign:"center", color:ex === undefined ? "grey" : "black", height:60, }

  return (
    <td width="20%" style={style} onClick={() => props.handleSelectExit(props.name)} id={props.name}>
    {props.name}<br/><i><ExitDest ex={ex}/></i>
    </td>
  )
}
// <ExitDest ex={ex}/>

const ExitDest = (props) => {
  if (props.ex === undefined) return (<span> </span>);

  const style = {border:"grey solid 1px", backgroundColor:'white', textAlign:  "center", color:"black", width:'90%', margin:'0 auto', padding:5};
  return (
    <div  style={style}>{props.ex.name}</div>
  )
}

//  style={style}

const ExitDetails = (props) => {
  function onChange(e) {
    props.objects.setExitValue(props.selected, 'useType', e.target.value)
  }

  if (props.selected === null) {
    return (
    <div>
    No exit selected
    </div>
    )
  }

  const object = props.objects.getCurrentObject()
  const ex = object[props.selected]
  const title = <b><i>{props.selected.charAt(0).toUpperCase() + props.selected.slice(1)}</i></b>
  if (ex === undefined) {
    return (
      <div>
        {title}
        <br/>
        <br/>
        <a onClick={() => props.objects.createExit(props.selected)}>[Create exit]</a>
      </div>
    )
  }
  else {
    const name = object.name + "_exit_" + props.selected;
    const options = ["---"].concat(props.objects.getObjectOnlyNames())

    return (
      <div>
        {title}
        <br/>
        <br/>
        Destination:
        <select
          className="form-control"
          id={name}
          name={name}
          onChange={props.handleChange}
          value={ex.name}
          title="Select the destination for this exit."
        >
        {options.map((s, i) => <option value={s} key={i}>{s}</option>)}
        </select>
        <a onClick={() => props.objects.deleteExit(props.selected)} className="deleteLink">(delete)</a>
        <a onClick={() => props.objects.setCurrentObjectByName(ex.name)} className="deleteLink">(go to location)</a>
        <br/>
        <br/>
        <input type="radio"
               value="default"
               checked={ex.data.useType === Constants.USETYPE_DEFAULT}
               onChange={onChange} />Default action
        <input type="radio"
               value="msg"
               checked={ex.data.useType === Constants.USETYPE_MSG}
               onChange={onChange}/>Message script
        <input type="radio"
               value="custom"
               checked={ex.data.useType === Constants.USETYPE_CUSTOM}
               onChange={onChange}/>Custom script
        <input type="radio"
               value="useWithDoor"
               checked={ex.data.useType === Constants.USETYPE_DOOR}
               onChange={onChange}/>Standard door script
        <br/>
        <br/>
        <ExitOptions objects={props.objects} selected={props.selected} ex={ex}/>
      </div>
    )
  }
}


const ExitOptions = (props) => {
  function onChange(e) {
    props.setExitValue(props.selected, e.target.id , e.target.value)
  }

  if (props.ex.data.useType === "default") return null

  if (props.ex.data.useType === "msg") {
    return (
      <div>
        <textarea
          className="form-control textarea"
          cols="500" rows="8"
          id={'msgScript'}
          name={"msgScript_" + props.selected}
          value={props.ex.data.msg}
          title="A script, with a local variable, 'char', the player or NPC."
          onChange={onChange} //TODO: Needs to change
        />
      </div>
    );
  }

  if (props.ex.data.useType === "custom") {
    return (
      <div>
        <textarea
          className="form-control textarea"
          cols="500" rows="8"
          id={'useScript'}
          name={"useScript_" + props.selected}
          value={props.ex.data.use}
          title="A script, with two local variables; 'char', the player or NPC and 'dir', the direction."
          onChange={onChange} //TODO: Needs to change
        />
      </div>
    );
  }

  if (props.ex.data.useType === "useWithDoor") {
    return (
    <table><tbody><tr>
      <td>Door:</td>
      <td><SelectComp name={"doorObject_" + props.selected} objects={props.objects} tooltip="Select the object that will be the door." handleChange={props.objects.updateExit} value={props.ex.data.door}/></td>
      </tr><tr>
      <td>Door name:</td>
      <td><input
          className="form-control"
          id={'doorName'}
          name="exitDoorName"
          type="text"
          title="This is how the player will see the door described."
          value={props.ex.data.doorName}
          onChange={onChange} //TODO: Needs to change
        /></td>
    </tr></tbody></table>
    )
  }
}
