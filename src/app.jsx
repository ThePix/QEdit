import React from 'react';
//import Blockly from 'blockly/blockly_compressed';

const prompt = require('electron-prompt');


import {SidePane} from './sidepane';
import {MainPane} from './mainpane';
//import {FileStore, Exit} from './filestore';
import {FileStore} from './filestore';
import {TabControls} from './tabcontrols';
const [QuestObject] = require('./questobject')

// Next four lines disable warning from React-hot-loader
import { hot, setConfig } from 'react-hot-loader'
setConfig({
    showReactDomPatchNotification: false
})


window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// Just disabling warning is not great, but so far I cannot see how to implement CSP
// The below does not work, but I do not know what will
/*
const { session } = require('electron')
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: Object.assign({
        "Content-Security-Policy": [ "default-src 'self'" ]
    }, details.responseHeaders)});
});*/



let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
const DSPY_SCENERY = 5;



// Not sure how default values will get saved; they may not be set if the user does nothing ith it.




const {Menu} = require('electron').remote;
import {Menus} from './menus';
const template = new Menus().getMenus();











export default class App extends React.Component {
  constructor(props) {
    super(props);

    //this.findMenuItem(template, 'New').click = () => this.newGame();
    this.findMenuItem(template, 'Open...').click = () => this.openXml();
    this.findMenuItem(template, 'Save').click = () => this.saveXml();
    //this.findMenuItem(template, 'Save As...').click = () => this.saveXmlAs();
    this.findMenuItem(template, 'Export to JavaScript').click = () => this.saveJs();
    this.findMenuItem(template, 'Add room').click = () => this.addObject("room");
    this.findMenuItem(template, 'Add item').click = () => this.addObject("item");
    this.findMenuItem(template, 'Add stub').click = () => this.addObject("stub");
    this.findMenuItem(template, 'Delete object').click = () => this.removeObject();
    this.findMenuItem(template, 'Duplicate object').click = () => this.duplicateObject();
    this.findMenuItem(template, 'Show only rooms for exits').click = () => this.toggleOption("showRoomsOnly");
    this.findMenuItem(template, 'Find').click = () => this.find();
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    this.fs = new FileStore();
    
    this.controls = new TabControls(["settings", "container", "wearable"]).getControls();
    const settings = this.createDefaultSettings();
    this.state = {
      objects:this.fs.readFile("example.asl6", settings),
      currentObjectName: false,
      options: {showRoomsOnly:true, },
    };
    this.state.currentObjectName = this.state.objects[0].name;
    for (let i = 0; i < this.state.objects.length; i++) {
      this.setDefaults(this.state.objects[i]);
    }
  }
  
  findMenuItem(template, label) {
    for (let i = 0; i < template.length; i++) {
      for (let j = 0; j < template[i].submenu.length; j++) {
        if (template[i].submenu[j].label === label) return template[i].submenu[j];
      }
    }
  }
  
  
  message(s) {
    document.getElementById('statusbar').innerHTML = "Status: <i>" + s + "</i>";
  }
  
  
  createDefaultSettings(settings) {
    const obj = new QuestObject({ name:"Settings", jsIsSettings:true });
    obj.addDefaults(this.controls);
    return obj;
  }
  
  
  
  openXml() {
    const dialogOptions = {
      //defaultPath: "c:/",
      filters: [
        { name: "All Files", extensions: ["*"] },
        { name: "Quest files", extensions: ["aslx", "asl6"] },
      ],
      properties: ["openFile"],
      title: 'Open file',
    };
    const { dialog } = require('electron').remote
    const result = dialog.showOpenDialog(dialogOptions)
    if (result) {
      const settings = this.createDefaultSettings();
      settings.jsFilename = result[0];
      this.setState({
        objects:this.fs.readFile(result[0], settings),
        currentObjectName: false,
        options: {showRoomsOnly:true, },
      });
      this.message("Opened: " + result[0]);
    }
    else {
      this.message("Open file cancelled");
    }
  }
  
  saveXml() {
    const result = this.fs.writeFile(this, this.state.objects);
    console.log(result);
    this.message(result);
  }
  
  //TODO!!!
  saveXmlAs() {
    console.log(this.state.objects);
    this.fs.writeFile(this.state.objects);
    console.log("Saved");
    this.message("Saved");
  }
  
  saveJs() {
    console.log(this.state.objects);
    this.fs.writeFileJS(this.state.objects);
    console.log("Saved");
    this.message("Saved");
  }
  
  removeObject(name) {
    if (name === undefined) {
      name = this.state.currentObjectName;
    }
    if (name === false) return;

    // may want to do this different, if setting has another name, say for another language
    console.log(name);
    if (name === "Settings") {    
      window.alert("Cannot delete the 'Settings' object.");
      return;
    }
    console.log("name");
    
    if (window.confirm('Delete the object "' + name + '"?')) {
      let s = this.state.currentObjectName === name ? this.state.objects[0].name : this.state.currentObjectName;
      this.setState({
        objects: this.state.objects.filter((o, i) => {
          return name !== o.name;
        }),
        currentObjectName: s,
      });
    }
  };

  removeConversionNotes(name) {
    console.log("In removeConversionNotes")
    if (window.confirm('Delete the conversion notes for this object?')) {
      this.setValue("jsConversionNotes", null);
    }
  };

  showObject(name) {
    //console.log("showObject" + index);
    this.setState({
      objects: this.state.objects,
      currentObjectName: name,
    })
  };

  addObject(objectType) {
    const newObject = new QuestObject({
      name:"new_" + objectType,
      jsIsStub:(objectType === "stub"),
      jsIsRoom:(objectType === "room"),
    });
    console.log("objectType=" + objectType);
    if (objectType !== "room" && this.state.currentObjectName) {
      newObject.loc = this.state.currentObjectName;
      console.log("Set location");
    }
    this.setDefaults(newObject);
    
    console.log(newObject);
      
    this.setState({
      objects: this.state.objects.concat([newObject]),
      currentObjectName: newObject.name,
    })
  };
  
  duplicateObject(name) {
    if (name === undefined) {
      name = this.state.currentObjectName;
    }
    if (name === false) return;
    
    const currentObject = this.state.objects.find(el => {
      return (el.name == name);
    });
    
    const newObject = new QuestObject(JSON.parse(JSON.stringify(currentObject))); // cloning the state
    newObject.name = this.nextName(name);
      
    this.setState({
      objects: this.state.objects.concat([newObject]),
      currentObjectName: newObject.name,
    })
  };
  
  selectTab(s) {
    const state = {
      objects: this.state.objects,
      currentObjectName: this.state.currentObjectName,
    }
    const currentObject = state.objects.find(el => {
      return (el.name == this.state.currentObjectName);
    });
    currentObject.jsTabName = s;
    
    this.setState(state)
  };

  
  toggleOption(name) {
    const state = {
      objects: this.state.objects,
      currentObjectName: this.state.currentObjectName,
      options: this.state.options
    }
    state.options[name] = !this.state.options[name];
    this.setState(state)
  };

  
  find() {
    // https://www.npmjs.com/package/electron-prompt
    prompt({
        title: 'Quest',
        label: 'Search fr',
        value: '',
        height:150,
        inputAttrs: {
            //type: 'url'
        }
    })
    .then((r) => {
        if(r === null) {
            console.log('user cancelled');
        } else {
            console.log('result', r);
        }
    })
    .catch(console.error);
    //console.log("Searchng for: " + term);
  };
  
  
  // remove on item from an attribute that is an array of strings
  removefromlist(item, att, name) {
    console.log("About to remove " + item + " from " + att);

    if (name === undefined) name = this.state.currentObjectName;
    if (name === false) return;
    
    const newObjects = JSON.parse(JSON.stringify(this.state.objects)); // cloning the state
    const currentObject = newObjects.find(el => el.name == name);
    console.log("currentObject is " + currentObject.name);
    
    currentObject[att] = currentObject[att].filter(el => el !== item);
    
    this.setState({
      objects:newObjects, 
      currentObjectName:this.state.currentObjectName,
    });
  }
  
  // remove on item from an attribute that is an array of strings
  addtolist(item, att, name) {
    console.log("About to add " + item + " to " + att);
    if (name === undefined) name = this.state.currentObjectName;
    if (name === false) return;
    
    const newObjects = JSON.parse(JSON.stringify(this.state.objects)); // cloning the state
    const currentObject = newObjects.find(el => el.name == name);
    console.log("currentObject is " + currentObject.name);
    
    currentObject[att].push(item);
    
    this.setState({
      objects:newObjects, 
      currentObjectName:this.state.currentObjectName,
    });
  };


  setDefaults(o) {
    //return;
    for (let i = 0; i < this.controls.length; i++) {
      const cons = this.controls[i].tabControls
      for (let j = 0; j < cons.length; j++) {
        if (o[cons[j].name] === undefined && cons[j].default !== undefined) {
          o[cons[j].name] = cons[j].default;
        }
      }
    }
  }
  
  findControl(name) {
    for (let i = 0; i < this.controls.length; i++) {
      const cons = this.controls[i].tabControls
      for (let j = 0; j < cons.length; j++) {
        if (cons[j].name === name) {
          return cons[j];
        }
      }
    }
    return null;
  }
  
  nextName(s) {
    if (/\d$/.test(s)) {
      const res = /(\d+)$/.exec(s);
      const n = parseInt(res[1]) + 1;
      return s.replace(res[1], "" + n);
    }
    else {
      return s + "1";
    }
  }
  
  nameTest(s) {
    let count = 0;
    for (let i = 0; i < this.state.objects.length; i++) {
      if (this.state.objects[i].name === s) count++;
    }
    return count !== 1;
  }
  
  handleChange(e) {
    this.setValue(e.target.id, e.target.value);
  }
  
  // numbers need their own handler so they get converted to numbers
  handleIntChange(e) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    this.setValue(e.target.id, parseInt(e.target.value));
  }

  // numbers need their own handler so they get converted to numbers
  handleListChange(e) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    this.setValue(e.target.id, e.target.value.split(/\r?\n/));
  }

  // Checkboxes need their own handler as they use the "checked" property...
  handleCBChange(e) {
    this.setValue(e.target.id, e.target.checked);
  }
  
  treeToggle(obj) {
    this.setValue("jsExpanded", !obj.jsExpanded, obj);
  }
  
  setValue(name, value, obj) {
    //console.log("----------------------------");
    //console.log(name);
    //console.log(value);
    //console.log(obj);
    const objName = (obj === undefined ? this.state.currentObjectName : obj.name);
    //console.log(objName);
    const newObjects = []  // cloning the state
    for (let i = 0; i < this.state.objects.length; i++) {
      newObjects.push(new QuestObject(this.state.objects[i]));
    }
      
    // Need to look in new list for old name, as the name may be changing
    const newObject = newObjects.find(el => {
      return (el.name == objName);
    });

    if (/_exit_/.test(name)) {
      const dir = /_exit_(.*)$/.exec(name)[1];
      //console.log("dir=" + dir);
      //console.log("was=" + newObject[dir].name);
      newObject[dir].name = value;
      //console.log("now=" + newObject[dir].name);
    }
    else {
      // Valid?
      const control = this.findControl(name);
      if (control && control.validator && control.validator(value, newObject)) return;
      // Do it!
      if (value === null) {
        delete newObject[name];
      }
      else {
        newObject[name] = value;
      }
    }

    this.setState({
      objects:newObjects, 
      currentObjectName:name === "name" ? value: this.state.currentObjectName,
    });
  }
  
  updateExit(name, action, data) {
    console.log("X----------------------------");
    console.log(name);
    if (typeof name !== "string") {
      const target = name.target;
      console.log(target.id);
      console.log(target.value);
      const l = target.id.split("_");
      name = l[1];
      action = l[0];
      data = target.value;
    }

    console.log(name);
    console.log(action);
    console.log(data);
    const objName = this.state.currentObjectName;
    console.log(objName);

    // clone the state
    const newObjects = JSON.parse(JSON.stringify(this.state.objects));
    const newObject = newObjects.find(el => {
      return (el.name == objName);
    });

    switch (action) {
      case "delete": if (window.confirm('Delete the exit "' + name + '"?')) newObject[name] = undefined; break;
      case "create": newObject[name] = new Exit(objName); break;
      case "useType": newObject[name].data.useType = data; break;
      case "doorName": newObject[name].data.doorName = data; break;
      case "doorObject": newObject[name].data.door = data; break;
      case "msgScript": newObject[name].data.msg = data; break;
      case "useScript": newObject[name].data.use = data; break;
    }

    this.setState({
      objects:newObjects, 
      currentObjectName:name === "name" ? value: this.state.currentObjectName,
    });
  }

  render() {

    const currentObject = this.state.objects.find(el => el.name === this.state.currentObjectName);
    return (<div>
      <MainPane
        object={currentObject} 
        handleChange={this.handleChange.bind(this)}
        removeObject={this.removeObject.bind(this)} 
        removefromlist={this.removefromlist.bind(this)} 
        removeConversionNotes={this.removeConversionNotes.bind(this)} 
        addtolist={this.addtolist.bind(this)}
        handleCBChange={this.handleCBChange.bind(this)}
        handleIntChange={this.handleIntChange.bind(this)} 
        handleListChange={this.handleListChange.bind(this)} 
        updateExit={this.updateExit.bind(this)}
        showObject={this.showObject.bind(this)}
        selectTab={this.selectTab.bind(this)}
        controls={this.controls}
        objects={this.state.objects} 
        options={this.state.options} 
        warning={this.nameTest(this.state.currentObjectName)}
      />
      <SidePane 
        object={currentObject} 
        objects={this.state.objects} 
        showObject={this.showObject.bind(this)}
        treeToggle={this.treeToggle.bind(this)}
        addObject={this.addObject.bind(this)}
      />
      <div id="statusbar">Status:</div>
    </div>);
  }
  
}















