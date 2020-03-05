import React from 'react';
import {ScriptComp, SelectComp} from './components';



let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
//const useWithDoor = function() {};
const DSPY_SCENERY = 5;






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
      data.push(<ExitsRow row={row} key={row} object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>)
    }
    
    return(<div>
      <table width="90%"><tbody>
      {data}
      </tbody></table>
      <br/>
      <br/>
      <ExitDetails object={this.props.object} objects={this.props.objects} options={this.props.options} selected={this.state.selected} handleChange={this.props.handleChange} updateExit={this.props.updateExit} showObject={this.props.showObject}/>
    </div>)
  }
}


const ExitsRow = (props) => {
  const data = []
  for (let col = 0; col < 5; col++) {
    if (EXITS[col + 5 * props.row].nocmd) {
      data.push(<td key={col + 5 * props.row}>&nbsp;</td>)
    }
    else {
      data.push(<Exit name={EXITS[col + 5 * props.row].name} key={col + 5 * props.row} object={props.object} selected={props.selected} handleSelectExit={props.handleSelectExit}/>);
    }
  }

  return (
    <tr>
    {data}
    </tr>
  );
}



const Exit = (props) => {
  const ex = props.object[props.name]
  const selected = (props.selected === props.name);
  const style = {border:"black solid 1px", backgroundColor:selected ? "yellow" : "#ffb", cursor:"pointer",textAlign:"center", color:ex === undefined ? "grey" : "black", height:60, };
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
  if (props.selected === null) {
    return (
    <div>
    No exit selected
    </div>
    )
  }

  const ex = props.object[props.selected]
  const title = <b><i>{props.selected.charAt(0).toUpperCase() + props.selected.slice(1)}</i></b>
  if (ex === undefined) {
    return (
      <div>
        {title}
        <br/>
        <br/>
        <a onClick={() => props.updateExit(props.selected, "create")}>[Create exit]</a>
      </div>
    )
  }
  else {
    const name = props.object.name + "_exit_" + props.selected;
    let list = props.objects;
    if (props.options.showRoomsOnly) list = props.objects.filter(o => o.jsIsRoom);
    const options = ["---"].concat(list.map((o, i) => o.name));
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
        <a onClick={() => props.updateExit(props.selected, "delete")} className="deleteLink">(delete)</a>
        <a onClick={() => props.showObject(ex.name)} className="deleteLink">(go to location)</a>
        <br/>
        <br/>
        <input type="radio"
               value="default"
               checked={ex.data.useType === "default"}
               onChange={() => props.updateExit(props.selected, "useType", "default")} />Default action
        <input type="radio"
               value="msg"
               checked={ex.data.useType === "msg"}
               onChange={() => props.updateExit(props.selected, "useType", "msg")}/>Message script
        <input type="radio"
               value="custom"
               checked={ex.data.useType === "custom"}
               onChange={() => props.updateExit(props.selected, "useType", "custom")}/>Custom script
        <input type="radio"
               value="useWithDoor"
               checked={ex.data.useType === "useWithDoor"}
               onChange={() => props.updateExit(props.selected, "useType", "useWithDoor")}/>Standard door script
        <br/>
        <br/>
        <ExitOptions object={props.object} objects={props.objects} selected={props.selected} ex={ex} updateExit={props.updateExit}/>
      </div>
    )
  }
}


const ExitOptions = (props) => {
  if (props.ex.data.useType === "default") return null;
  
  if (props.ex.data.useType === "msg") {
    return (
      <div>
        <textarea
          className="form-control textarea"
          cols="500" rows="8"
          id={"msgScript_" + props.selected}
          name={"msgScript_" + props.selected}
          value={props.ex.data.msg}
          title="A script, with a local variable, 'char', the player or NPC."
          onChange={props.updateExit}
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
          id={"useScript_" + props.selected}
          name={"useScript_" + props.selected}
          value={props.ex.data.use}
          title="A script, with two local variables; 'char', the player or NPC and 'dir', the direction."
          onChange={props.updateExit}
        />    
      </div>
    );
  }

  if (props.ex.data.useType === "useWithDoor") {
    return (
    <table><tbody><tr>
      <td>Door:</td>
      <td><SelectComp name={"doorObject_" + props.selected} objects={props.objects} tooltip="Select the object that will be the door." handleChange={props.updateExit} value={props.ex.data.door}/></td>
      </tr><tr>
      <td>Door name:</td>
      <td><input
          className="form-control"
          id={"doorName_" + props.selected}
          name="exitDoorName"
          type="text"
          title="This is how the player will see the door described."
          value={props.ex.data.doorName}
          onChange={props.updateExit}
        /></td>
    </tr></tbody></table>
    )
  }
}