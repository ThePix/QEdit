import React from 'react';



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
    console.log("dir:" + dir);
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
  const style = {border:"black solid 1px", backgroundColor:selected ? "yellow" : "#ffb", cursor:"pointer",textAlign:"center", color:ex === undefined ? "grey" : "black", height:50, };
  return (
    <td width="20%" style={style} onClick={() => props.handleSelectExit(props.name)} id={props.name}>
    {props.name}<br/><i>{ex === undefined ? " " : "[" + ex.name + "]"}</i>
    </td>
  )
}


const ExitDetails = (props) => {
  if (props.selected === null) {
    return (
    <div>
    No exit selected
    </div>
    )
  }

  console.log("props.selected=" + props.selected);
  const ex = props.object[props.selected]
  const title = <b><i>{props.selected.charAt(0).toUpperCase() + props.selected.slice(1)}</i></b>
  console.log("ex=" + ex);
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
    console.log("name=" + props.object.name);
    console.log("name=" + props.selected);
    const name = props.object.name + "_exit_" + props.selected;
    console.log("name=" + name);
    console.log("props.objects=" + props.objects.length);
    let list = props.objects;
    if (props.options.showRoomsOnly) list = props.objects.filter(o => o.jsIsRoom);
    const options = ["---"].concat(list.map((o, i) => o.name));
    console.log("options=" + options.length);
    console.log("props.handleChange=" + props.handleChange);
    console.log("1props.updateExit=" + props.updateExit);
    console.log("exitUseType=" + ex.data.useType);
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
        <a onClick={() => props.showObject(ex.name)} className="deleteLink">(go to room)</a>
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
  console.log("here");
  if (props.ex.data.useType === "default") return null;
  
  if (props.ex.data.useType === "msg") {
    return (<div>Text here</div>);
  }

  if (props.ex.data.useType === "custom") {
    return (<div>Script here</div>);
  }

  if (props.ex.data.useType === "useWithDoor") {
    return (
    <div>
      Door: <br/>
      Door name:
    </div>
    )
  }


}