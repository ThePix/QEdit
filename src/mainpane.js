import React from 'react';
import {ExitsComp} from './exitscomp';
import {ScriptOrStringComp} from './scriptorstringcomp';

const [QuestObject] = require('./questobject')

let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
const DSPY_SCENERY = 5;




export class MainPane extends React.Component {
  constructor(props) {
    super(props);
  }
  
  
  
  render() {

    if (this.props.object) {
      const control = this.props.object.getCurrentTab(this.props.controls);
      const tab = control.tabName;
      const style = {color:this.props.object.jsColour};
      const pStyle = {backgroundColor:this.props.warning ? 'yellow' : 'white', padding:3};
      const controls = control.tabControls;
      
      // Will later need to check if this object has the current tab and set tab to zero if not
      return (<div id="mainpane">
        <p style={pStyle}><b><i>Editing {this.props.object.jsIsRoom ? "Room" : "Item"}:</i> <span style={style}>{this.props.object.name}</span></b> <a onClick={() => this.props.removeObject(this.props.object.name)} className="deleteLink">(delete)</a></p>
        
          <Tabs object={this.props.object} controls={this.props.controls} tab={tab} selectTab={this.props.selectTab}/>
          
          <TabComp 
            tab={tab}
            object={this.props.object} 
            removefromlist={this.props.removefromlist} 
            addtolist={this.props.addtolist} 
            handleChange={this.props.handleChange} 
            handleIntChange={this.props.handleIntChange}
            handleListChange={this.props.handleListChange}
            handleCBChange={this.props.handleCBChange}
            removeConversionNotes={this.props.removeConversionNotes}
            controls={controls} 
            objects={this.props.objects} 
            updateExit={this.props.updateExit} 
            showObject={this.props.showObject} 
            options={this.props.options}/>

          </div>);
    }
    else {
      //this.state = {};
      return (<div id="mainpane">
        <h2>Welcome!</h2>
      </div>);
    }
  }
}




const Tabs = (props) => {
  const controls = [];
  for (let i = 0; i < props.controls.length; i++) {
    if (props.object.displayIf(props.controls[i])) {
      controls.push(props.controls[i]);
    }
  }

  return  <div>
    {controls.map((item, i) => 
        <a onClick={() => props.selectTab(item.tabName)} key={i} disabled={props.tab === item.tabName} className ="tabButton">{item.tabName}</a>
    )}
  </div>;
}



const TabComp = (props) => {
  const controls = props.controls//.filter(el => el.tab == props.tab);  // double equals not triple!
  if (props.tab === "Exits") {
    return (
      <div className="tabContent">
      <ExitsComp handleChange={props.handleChange} objects={props.objects} object={props.object} updateExit={props.updateExit} showObject={props.showObject} options={props.options}/>
      </div>
    )
  }
  else {
    return (
      <div className="tabContent">
      <table><tbody>
        {controls.map((item, i) => <InputComp 
          removefromlist={props.removefromlist} 
          addtolist={props.addtolist} 
          handleChange={props.handleChange}
          handleIntChange={props.handleIntChange}
          handleListChange={props.handleListChange}
          handleCBChange={props.handleCBChange}
          removeConversionNotes={props.removeConversionNotes}
          input={item} 
          key={i} 
          objects={props.objects} 
          object={props.object}/>
      )}
      </tbody></table>
      </div>
    )
  }
}





const InputComp = (props) => {
  if (!props.object.displayIf(props.input)) return null;

  let value = props.object[props.input.name];
  if (props.input.type === "select") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} options={props.input.options} tooltip={props.input.tooltip} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    );
  }
  else if (props.input.type === "objects") {
    return (
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <SelectComp name={props.input.name} objects={props.objects} tooltip={props.input.tooltip} handleChange={props.handleChange} value={value}/>
        </td>
      </tr>
    );
  }
  else if (props.input.type === "flag") {
    return (  
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input 
          type="checkbox"
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          checked={value}
          title={props.input.tooltip}
          onChange={props.handleCBChange}
        /></td>
      </tr>
    )
  }
  else if (props.input.type === "todolist") {
    return (  
      <tr className="form-group">
        <td colSpan="2">
        <br/>
        These issues were identified when this game was converted from Quest 5. Click
        <a onClick={() => props.removeConversionNotes()} className="stdLink"> here </a>
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
    //return null;
    return (  
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td>
          <textarea
            className="form-control stringlist"
            cols="400" rows="6"
            id={props.input.name}
            name={props.input.name}
            value={value}
            title={props.input.tooltip + " Each entry in the list should be on a line on its own; press Enter to go to the next entry."}
            onChange={props.handleChange}
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
  else if (props.input.type === "text" || props.input.type === "string") {
    return (  
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type={props.input.type}
          title={props.input.tooltip}
          value={value}
          onChange={props.handleChange}
        /></td>
      </tr>
    )
  }
  else if (props.input.type === "longtext" || props.input.type === "longstring") {
    return (  
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type={props.input.type}
          size="120"
          title={props.input.tooltip}
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
          title={props.input.tooltip}
          value={value ? value : props.input.default}
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






class SelectComp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let options;
    if (this.props.objects !== undefined) {
      options = ["---"].concat(this.props.objects.map((o, i) => o.name));
    }
    else {
      options = this.props.options;
    }
    if (options === undefined) {
      console.log("WARNING: No options provided for select on this tab.");
      console.log(this.props);
      return null;
    }
    
    return (
      <select
          className="form-control"
          id={this.props.name}
          name={this.props.name}
          value={this.props.value}
          title={this.props.tooltip}
          onChange={this.props.handleChange}
        >
        {options.map((s, i) => <option value={s} key={i}>{s}</option>)}
        </select>
    )
  }
}


