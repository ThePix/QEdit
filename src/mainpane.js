import React from 'react';
import {ExitsComp} from './exitscomp';
import {ScriptComp, SelectComp} from './components';


let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
const DSPY_SCENERY = 5;

const controlDisplayIf = function(o, control) {
  try {
    return !control.displayIf || eval(control.displayIf);
  }
  catch (err) {
    console.log("------------------------------");
    console.log("Error in displayIf");
    console.log(err.message);
    console.log(o.name);
    console.log(control.displayIf);
  }
}



export class MainPane extends React.Component {
  constructor(props) {
    super(props);
  }
  
  
  
  render() {

    if (this.props.object) {
      let tab = (this.props.object.jsTabName ? this.props.object.jsTabName : this.props.controls[0].tabName);
      let control = this.props.controls.find(el => el.tabName === tab);
      if (!control) console.log("Failed to find control: " + this.props.object.jsTabName);
      if (!controlDisplayIf(this.props.object, control)) {
        console.log("Here");
        tab = this.props.controls[0].tabName
        control = this.props.controls[0];
      } 

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
            removeFromList={this.props.removeFromList} 
            addToList={this.props.addToList} 
            handleChange={this.props.handleChange} 
            handleIntChange={this.props.handleIntChange}
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
    if (controlDisplayIf(props.object, props.controls[i])) {
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
          removeFromList={props.removeFromList} 
          addToList={props.addToList} 
          handleChange={props.handleChange}
          handleIntChange={props.handleIntChange}
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
  if (!controlDisplayIf(props.object, props.input)) return null;

  const value = props.object[props.input.name];
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
        <td><span className="fieldName">{props.input.display}</span></td>
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
        <td colSpan="2"><span className="fieldTitle">{props.input.display}</span></td>
      </tr>
    )
  }
  else if (props.input.type === "scriptstring") {
    return (
      <ScriptOrStringComp input={props.input} value={value} handleChange={props.handleChange}/>
    )
  }
  else if (props.input.type === "stringlist") {
    //return null;
    return (  
      <tr className="form-group">
        <td><span className="fieldName">{props.input.display}</span></td>
        <td><ListComp 
          name={props.input.name}
          title={props.input.tooltip}
          value={value}
          onChange={props.handleChange}
          removeFromList={props.removeFromList} 
          addToList={props.addToList}
          options={props.input.options}
        /></td>
      </tr>
    )
  }
  else if (props.input.type === "text") {
    return (  
      <tr className="form-group">
        <td><span className="fieldName">{props.input.display}</span></td>
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
  else if (props.input.type === "int") {
    return (  
      <tr className="form-group">
        <td><span className="fieldName">{props.input.display}</span></td>
        <td><input
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          type="number"
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


const ListComp = (props) => {
  if (!props.options) {
    console.log("No options set for the control: " + props.name);
    return null;
  }
  const notSelected = props.options.filter(el => !props.value.includes(el));
  return (
    <div>
      <span className="selectedList">
        {props.value.map((s, i) => <span key={i}>{s}[<a onClick={() => props.removeFromList(s, props.name)} className="deleteLink">del</a>] </span>)}
      </span>
      <br/>
      <span className="unselectedList">
        {notSelected.map((s, i) => <span key={i}>{s}[<a onClick={() => props.addToList(s, props.name)} className="deleteLink">add</a>] </span>)}
      </span>
    </div>
  )
}



export class ScriptOrStringComp extends React.Component {
  constructor(props) {
    super(props);
    this.value = props.value;
    this.id = props.input.name
    this.handleChange=this.props.handleChange;
  }
  
  handleScriptChange(e) {
    //console.log(e.target)
    //console.log(this.props.value)
    let value;
    if (e.target.checked) {
      value = "function() {\n" + this.props.value + "}";
    }
    else {
      const md = /^function\((.*?)\) {\n?([\s\S]*)}\S*$/.exec(this.props.value)
      value = md === null ? this.text : value = md[2];
    }
    //console.log(value)
    
    e = {target:{ id:this.id,  value:value, }};
    this.handleChange(e);
  }

  render() {
    const isScript = /^function\(/.test(this.props.value);
    return (  
      <tr className="form-group">
        <td colSpan="2">
        <span className="fieldName">{this.props.input.display}</span>
        <input 
            type="checkbox"
            className="form-control"
            id={this.props.input.name}
            name={this.props.input.name}
            checked={isScript}
            title="Tick if this is a script, untick for a string"
            onChange={this.handleScriptChange.bind(this)}
          /> Script?
        <br/>
        {isScript ?
          <ScriptComp input={this.props.input} value={this.props.value} handleChange={this.props.handleChange}/>  :
          <textarea
            className="form-control textarea"
            cols="500" rows="16"
            id={this.props.input.name}
            name={this.props.input.name}
            value={this.props.value}
            title={this.props.input.tooltip}
            onChange={this.props.handleChange}
          />
        }
        </td>
      </tr>
    )
  }
}



