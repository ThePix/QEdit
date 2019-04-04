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
  return (
    <div className="tabContent">
    <table><tbody>
      {controls.map((item, i) => <InputComp removeFromList={props.removeFromList} addToList={props.addToList} handleChange={props.handleChange} handleCBChange={props.handleCBChange} input={item} key={i} objects={props.objects} object={props.object}/>
    )}
    </tbody></table>
    </div>
  )
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

