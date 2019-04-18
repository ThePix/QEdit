import React from 'react';



export class MainPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab:this.props.controls[0].tabName,
    }
  }
  
  selectTab(s) {
    console.log(s);
    this.setState({
      tab:s,
    })
  };

  render() {
    if (this.props.object) {
      const style = {color:this.props.object.jsColour};
      const pStyle = {backgroundColor:this.props.warning ? 'yellow' : '#eee', padding:3};
      
      const controls=this.props.controls.find(el => el.tabName === this.state.tab).tabControls;
      // Will later need to check if this object has the current tab and set tab to zero if not
      return (<div id="mainpane">
        <p style={pStyle}><b><i>Editing {this.props.object.jsIsRoom ? "Room" : "Item"}:</i> <span style={style}>{this.props.object.name}</span></b> <a onClick={() => this.props.removeObject(this.props.object.name)} className="deleteLink">(delete)</a></p>
          <Tabs object={this.props.object} controls={this.props.controls} tab={this.state.tab} selectTab={this.selectTab.bind(this)}/>
          <TabComp tab={this.state.tab} object={this.props.object} removeFromList={this.props.removeFromList} addToList={this.props.addToList} handleChange={this.props.handleChange} handleCBChange={this.props.handleCBChange} controls={controls} objects={this.props.objects}/>

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
    if (props.controls[i].displayIf === undefined || props.controls[i].displayIf(props.object)) {
      controls.push(props.controls[i]);
    }
  }
  console.log(controls.length);
  //return null;
  return  <div>
    {controls.map((item, i) => 
        <a onClick={() => props.selectTab(item.tabName)} key={i} disabled={props.tab === item.tabName} className ="tabButton">{item.tabName}</a>
    )}
  </div>;
}



const TabComp = (props) => {
  const controls = props.controls//.filter(el => el.tab == props.tab);  // double equals not triple!
  console.log("tab=" + props.tab);
  if (props.tab === "Exits") {
    return (
      <div className="tabContent">
      <ExitsComp handleChange={props.handleChange} object={props.object}/>
      </div>
    )
  }
  else {
    return (
      <div className="tabContent">
      <table><tbody>
        {controls.map((item, i) => <InputComp removeFromList={props.removeFromList} addToList={props.addToList} handleChange={props.handleChange} handleCBChange={props.handleCBChange} input={item} key={i} objects={props.objects} object={props.object}/>
      )}
      </tbody></table>
      </div>
    )
  }
}





const InputComp = (props) => {
  if (props.input.displayIf !== undefined && !props.input.displayIf(props.object)) {
    return null;
  }
  const value = props.object[props.input.name];
  if (props.input.type === "select" || props.input.type === "objects") {
    let options;
    if (props.input.type === "objects") {
      options = ["---"].concat(props.objects.map((o, i) => o.name));
    }
    else {
      options = props.input.options;
    }
    return (  
      <tr className="form-group">
        <td width="30%"><span className="fieldName">{props.input.display}</span></td>
        <td><select
          className="form-control"
          id={props.input.name}
          name={props.input.name}
          value={value}
          title={props.input.tooltip}
          onChange={props.handleChange}
        >
        {options.map((s, i) => <option value={s} key={i}>{s}</option>)}
        </select></td>
      </tr>
    )
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
  else {
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
}


const ListComp = (props) => {
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





export class ScriptComp extends React.Component {
  constructor(props) {
    super(props);
    this.value = props.value;
    this.id = props.input.name
    this.handleChange=this.props.handleChange;
  }
  
  handleScriptChange(e) {
    //console.log("s----------------------------");
    //console.log(e);
    //console.log(typeof this.handleChange);
    const value = "function(" + this.params + ") {\n" + e.target.value + "}";
    e = {target:{ id:this.id,  value:value, }};
    this.handleChange(e);
  }

  handleParamChange(e) {
    const value = "function(" + e.target.value + ") {\n" + this.text + "}";
    e = {target:{ id:this.id,  value:value, }};
    this.handleChange(e);
  }


  render() {
    let isValid = true;
    //console.log("----------------------------");
    //console.log(this.props.value);
    //console.log(typeof this.props.value);
    const md = /^function\((.*?)\) {\n?([\s\S]*)}\S*$/.exec(this.props.value)
    if (md === null) {
      this.params = "WARNING: Failed to parse function";
      this.text = this.props.value
    }
    else {
      this.params = md[1];
      this.text = md[2];
      try {
        console.log(this.text);
        //eval(this.text);
        
        let result = function(str, params){
          console.log("-------------------");
          console.log(params);
          const l = params.split(",");
          let preamble = ""
          for (let i = 0; i < l.length; i++) {
            const name = l[i].trim();
            console.log("var " + name);
            if (name.length > 0) preamble += "var " + name + ";\n";
          }
          console.log(preamble + str);
          return eval(preamble + str);
        }.call(RunEnviro, this.text, this.params);
        
        //eval(this.props.value);
        console.log('Code is good');
      }
      catch (err) {
        isValid = false;
        console.log('Error in function code');
        //console.log('------------------------');
        console.log(err);
        //console.log('------------------------');
      }
    }
    const style = {backgroundColor:isValid ? "white" : "yellow"};
    return (  
      <div style={style}>
        <span className="fieldName">Parameters (separated with commas)</span>
        <input
          className="form-control"
          id={this.props.input.name}
          name={this.props.input.name}
          type={this.props.input.type}
          title={this.props.input.tooltip}
          value={this.params}
          onChange={this.handleParamChange.bind(this)}
        />
        <br/>
        <textarea
          className="form-control textarea"
          cols="500" rows="16"
          id={this.props.input.name}
          name={this.props.input.name}
          value={this.text}
          title={this.props.input.tooltip}
          onChange={this.handleScriptChange.bind(this)}
        />
      </div>
    )
  }
}





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
    return(<div>
      <table width="90%"><tbody>
      <tr>
      <Exit name="northwest" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      <Exit name="north" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      <Exit name="northeast" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      </tr>
      <tr>
      <Exit name="west" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      <td></td>
      <Exit name="east" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      </tr>
      <tr>
      <Exit name="southwest" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      <Exit name="south" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      <Exit name="southeast" object={this.props.object} selected={this.state.selected} handleSelectExit={this.handleSelectExit.bind(this)}/>
      </tr>
      </tbody></table>
      <ExitDetails object={this.props.object} selected={this.state.selected}/>
    </div>)
  }
}




const Exit = (props) => {
  console.log(`Looking for ${props.name} in ${props.object.name}`)
  const ex = props.object[props.name]
  const selected = (props.selected === props.name);
  console.log(`Found ${ex}`);
  const style = {border:"black solid 1px", backgroundColor:selected ? "yellow" : "#ffb", cursor:"pointer",textAlign:"center" };
  return (
    <td width="20%" style={style} onClick={() => props.handleSelectExit(props.name)} id={props.name}>
    {props.name}<br/><i>{ex === undefined ? "---" : "[" + ex.name + "]"}</i>
    </td>
  )
}


const ExitDetails = (props) => {
  if (props.selected === null) {
    return (
    <p>No exit selected</p>
    )
  }

  console.log("props.selected=" + props.selected);
  const ex = props.object[props.selected]
  console.log("ex=" + ex);
  const options = ["---"].concat(props.objects.map((o, i) => o.name));
  if (ex === undefined) {
    return (
      <div>
      [No exit]
      </div>
    )
  }
  else {
    return (
      <div>
      Destination: 
      <select
          className="form-control"
          id={props.object.name + _exit_ + props.selected}
          name={props.object.name + _exit_ + props.selected}
          value={ex.name}
          title="Select the destionation for this exit."
          onChange={props.handleChange}
        >
        {options.map((s, i) => <option value={s} key={i}>{s}</option>)}
        </select>
      </div>
    )
  }
}


const beautifyFunction = function(str, indent) {
    console.log("=----------------------------");
  let res = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") {
      indent++;
      res += "{\n" + tabs(indent);
    }
    else if (str[i] === "}") {
      res = res.trim();
      indent--;
      res += "\n" + tabs(indent) + "}\n" + tabs(indent);
    }
    else if (str[i] === ";") {
      res += ";\n" + tabs(indent);
    }
    else {
      res += str[i];
    }
  }
  return res.trim();
}

const tabs = function(n) {
  let res = "";
  for (let i = 0; i < n; i++) res += "  ";
  return res;
}




const RunEnviro = {}

const msg = function(s){}

