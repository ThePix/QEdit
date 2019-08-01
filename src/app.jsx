import React from 'react';
import Blockly from 'blockly/blockly_compressed';

const prompt = require('electron-prompt');


import {SidePane} from './sidepane';
import {MainPane} from './mainpane';
import {FileStore, Exit} from './filestore';
import {TabControls} from './tabcontrols';

// Next four lines disable warning from React-hot-loader
import { hot, setConfig } from 'react-hot-loader'
setConfig({
    showReactDomPatchNotification: false
})


window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
// Just disabling warning is not great, but so far I cannot see how to implement CSP
// The below does not work, but I do not know what
/*
const { session } = require('electron')
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: Object.assign({
        "Content-Security-Policy": [ "default-src 'self'" ]
    }, details.responseHeaders)});
});*/

const XML_FILE = 'example';



let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
const DSPY_SCENERY = 5;



// Not sure how default values will get saved; they may not be set if the user does nothing ith it.




//import { app, Menu } from 'electron';
const {Menu} = require('electron').remote;

const template = [
  {
    label: 'File',
    submenu: [
      { label: 'Save XML', },
      { label: 'Save JavaScript', },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { label: 'Add room', },
      { label: 'Add item', },
      { label: 'Add stub', },
      { label: 'Delete object', },
      { label: 'Duplicate object', },
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { 
        label: 'Preview in browser',
        click () { require('electron').shell.openExternal("file://" + FILENAME) }
      }
    ]
  },
  {
    label: 'Options',
    submenu: [
      { 
        label: 'Show only rooms for exits', type: 'checkbox', checked : true,
      }
    ]
  },
  {
    label: 'Search',
    submenu: [
      { 
        label: 'Find',
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Help',
        click () {
          require('electron').shell.openExternal('https://github.com/ThePix/QEdit/wiki');
        }
      },
      {
        label: 'About',
        click () {
          
const { dialog } = require('electron')

const response = dialog.showMessageBox(null);
console.log(response);          
          
          /*
          const dialog = require('electron');
          dialog.showMessageBox({
            type:"info",
            title:"About",
            message:"QEdit is under development.\nCopyright 2019",
          });*/
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })

  // Edit menu
  template[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}












export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.findMenuItem(template, 'Save XML').click = () => this.saveXml();
    this.findMenuItem(template, 'Add room').click = () => this.addObject("room");
    this.findMenuItem(template, 'Add item').click = () => this.addObject("item");
    this.findMenuItem(template, 'Add stub').click = () => this.addObject("stub");
    this.findMenuItem(template, 'Delete object').click = () => this.removeObject();
    this.findMenuItem(template, 'Duplicate object').click = () => this.duplicateObject();
    this.findMenuItem(template, 'Show only rooms for exits').click = () => this.toggleOption("showRoomsOnly");
    this.findMenuItem(template, 'Find').click = () => this.find();
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    this.fs = new FileStore(XML_FILE);
    
    this.controls = new TabControls(["settings", "container", "wearable"]).getControls();
    const settings = this.createDefaultSettings();
    this.state = {
      objects:this.fs.readFile(settings),
      currentObjectName: false,
      options: {showRoomsOnly:true, },
    };
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
    console.log(settings);
    const obj = { name:"Settings", jsIsSettings:true };
    //for (let i = 0; i < this.controls.length; i++) {
      
      
    //}  
    return obj;
  }
  
  
  saveXml() {
    this.fs.writeFile(this.state.objects);
    console.log("Saved");
    this.message("Saved");
  }
  
  removeObject(name) {
    if (name === undefined) {
      name = this.state.currentObjectName;
    }
    if (name === false) return;
    if (window.confirm('Delete the object "' + name + '"?')) {
      let s = this.state.currentObjectName === name ? false : this.state.currentObjectName;
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
    const newObject = {
      name:"new_" + objectType,
      jsIsStub:(objectType === "stub"),
      jsIsRoom:(objectType === "room"),
    };
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
    
    const newObject = JSON.parse(JSON.stringify(currentObject)); // cloning the state
    newObject.name = this.nextName(name);
      
    this.setState({
      objects: this.state.objects.concat([newObject]),
      currentObjectName: newObject.name,
    })
  };
  
  selectTab(s) {
    console.log("app.jsx: " + s);
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
  removeFromList(item, att, name) {
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
  addToList(item, att, name) {
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
    const newObjects = JSON.parse(JSON.stringify(this.state.objects)); // cloning the state
      
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
        removeFromList={this.removeFromList.bind(this)} 
        removeConversionNotes={this.removeConversionNotes.bind(this)} 
        addToList={this.addToList.bind(this)}
        handleCBChange={this.handleCBChange.bind(this)} 
        handleIntChange={this.handleIntChange.bind(this)} 
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















