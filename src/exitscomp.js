import React from 'react';



let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
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
      <ExitDetails object={this.props.object} objects={this.props.objects} options={this.props.options} selected={this.state.selected} handleChange={this.props.handleChange} updateExit={this.props.updateExit}/>
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
  const style = {border:"black solid 1px", backgroundColor:selected ? "yellow" : "#ffb", cursor:"pointer",textAlign:"center", color:ex === undefined ? "grey" : "black" };
  return (
    <td width="20%" style={style} onClick={() => props.handleSelectExit(props.name)} id={props.name}>
    {props.name}<br/><i>{ex === undefined ? "" : "[" + ex.name + "]"}</i>
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
  console.log("ex=" + ex);
  if (ex === undefined) {
    return (
      <div>
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
    return (
      <div>
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
      </div>
    )
  }
}


