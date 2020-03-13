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



const useWithDoor = function() {};
const DSPY_SCENERY = 5;



// Not sure how default values will get saved; they may not be set if the user does nothing ith it.




const {Menu, dialog, app} = require('electron').remote;
import {Menus} from './menus';
const template = new Menus().getMenus();


let quitConfirmed = false
const quitOptions  = {
  buttons: ["Yes", "No"],
  message: "Do you really want to quit?",
  detail:'Any unsaved work will be lost.',
  type:'warning',
}
const newOptions  = {
  buttons: ["Yes", "No"],
  message: "Do you really want to start a new game?",
  detail:'Any unsaved work will be lost.',
  type:'warning',
}








export default class App extends React.Component {
  constructor(props) {
    super(props);
    
    const menuMapping = {
      'New':        () => this.newGame(),
      'Open...':    () => this.openXml(),
      'Save':       () => this.saveXml(),
      'Save As...': () => this.saveXmlAs(),
      'Export to JavaScript': () => this.saveJs(),
      'Exit':       () => this.exitApp(),

      'Add location':   () => this.addObject("room"),
      'Add item':   () => this.addObject("item"),
      'Add stub':   () => this.addObject("stub"),
      'Delete object': () => this.removeObject(),
      'Duplicate object': () => this.duplicateObject(),
      
      'Find': () => this.find(),
      'Find next': () => this.findNext(),
      'Search backwards': () => this.searchBackwards = !this.searchBackwards,
      'Search case sensitive': () => this.searchCaseSensitive = !this.searchCaseSensitive,

    }

    for (let key in menuMapping) {
      this.findMenuItem(template, key).click = menuMapping[key]
    }
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    this.searchTerm = ''
    this.searchBackwards = false
    this.searchCaseSensitive = true
    this.fs = new FileStore();
    
    this.controls = new TabControls(this.fs.getTabFiles()).getControls();
    const settings = this.createDefaultSettings();
    this.state = {
      objects:this.fs.readFile("blank.asl6", settings),
      currentObjectName: false,
    };
    this.state.currentObjectName = this.state.objects[0].name;
    //for (let i = 0; i < this.state.objects.length; i++) {
    //  this.setDefaults(this.state.objects[i]);
    //}
    
    
    window.addEventListener("beforeunload", function(e) {
      console.log("beforeunload")
      console.log(quitConfirmed)
      //e.defaultPrevented = true;
      if (!quitConfirmed) {
        const response = dialog.showMessageBox(quitOptions)
        console.log(response)
        if (response === 1) {
          console.log('here')
          e.returnValue = "\o/";
        }
      }
      console.log(e)
      console.log(quitConfirmed)
    });
    
    const _this = this
    window.addEventListener('load', function(e) {
      _this.message("All good to go...")
      setTimeout(_this.autosaveXml.bind(_this), 300000)
    })
    
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
  
  exitApp() {
    const response = dialog.showMessageBox(quitOptions)
    if (response === 0) {
      quitConfirmed = true
      app.quit(0)
    }
    return false
  }    
  
  newGame() {
    const response = dialog.showMessageBox(newOptions)
    if (response === 0) {
      const objects = this.fs.readFile("blank.asl6", {})
      this.setState({
        objects:objects,
        currentObjectName: objects[0].name,
      })
      this.message("New game");
    }
    else {
      this.message("New game cancelled");
    }
  }
  
  openXml() {
    const dialogOptions = {
      //defaultPath: "c:/",
      filters: [
        { name: "All Files", extensions: ["*"] },
        { name: "Quest files", extensions: ["asl6", "aslx"] },
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
      });
      this.message("Opened: " + result[0]);
    }
    else {
      this.message("Open file cancelled");
    }
  }
  
  
  autosaveXml() {
    if (this.autosaveCount === undefined) this.autosaveCount = -1
    this.autosaveCount++
    if (this.autosaveCount > 9) this.autosaveCount = 0
    this.saveXml("autosaves/autosave" + this.autosaveCount + ".asl6")
    const settings = this.state.objects.find(el => el.jsIsSettings)
    if (settings.jsAutosaveInterval !== 0) {
      setTimeout(this.autosaveXml.bind(this), settings.jsAutosaveInterval * 60000)
    }
  }
  
  
  saveXml(filename) {
    if (!filename) {
      const settings = this.state.objects.find(el => el.jsIsSettings)
      filename = settings.jsFilename
    }

    if (filename) {
      const result = this.fs.writeFile(this, this.state.objects, filename);
      console.log(result);
      this.message(result);
    }
    else {
      this.saveXmlAs()
    }
  }
  
  
  
  
  
  saveXmlAs() {
    const dialogOptions = {
      //defaultPath: "c:/",
      filters: [
        { name: "All Files", extensions: ["*"] },
        { name: "Quest files", extensions: ["asl6", "aslx"] },
      ],
      properties: ["openFile"],
      title: 'Open file',
    };
    const { dialog } = require('electron').remote
    const filename = dialog.showSaveDialog(dialogOptions)
    console.log(filename)
    if (filename) {
      const settingsIndex = this.state.objects.findIndex(el => el.jsIsSettings)
      this.state.objects[settingsIndex].jsFilename = filename
      this.setState({
        objects:this.state.objects,
      });
      this.saveXml(filename)
    }
    else {
      this.message("Save as file cancelled");
    }
  }
  
  saveJs(filename) {
    const settings = this.state.objects.find(el => el.jsIsSettings)
    if (!settings.jsFilename) {
      console.log('Save your game before exporting');
      this.message('Save your game before exporting');
      return
    }      
    
    const result = this.fs.writeFileJS(this.state.objects, settings.jsFilename);
    console.log(result);
    this.message(result);
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
      jsMobilityType:'Immobile',
    });
    console.log("objectType=" + objectType);
    
    const settings =  this.state.objects.find(el => el.jsIsSettings)
    let currentObject = this.state.objects.find(el => el.name === this.state.currentObjectName)
    console.log("jsNewRoomWhere=" + settings.jsNewRoomWhere);
    console.log(!currentObject.jsIsSettings && !(currentObject.jsIsRoom && settings.jsNewRoomWhere === "Top"));
    console.log(currentObject.jsIsSettings);
    console.log((currentObject.jsIsRoom && settings.jsNewRoomWhere === "Top"));
    console.log(currentObject.jsIsRoom);
    
    // If the current object is the settings, OR if the current object is a room and new rooms go top,
    // then loc is undefined, otherwise, do this:
    if (!currentObject.jsIsSettings && !(newObject.jsIsRoom && settings.jsNewRoomWhere === "Top")) {
      if (newObject.jsIsRoom && settings.jsNewRoomWhere === "Location") {
        console.log("Looking for room");
        while (currentObject && !currentObject.jsIsRoom) {
          currentObject = this.state.objects.find(el => el.name === currentObject.loc)
        }
      }  
      if (newObject.jsIsRoom && settings.jsNewRoomWhere === "Zone") {
        console.log("Looking for zone");
        while (currentObject && !currentObject.jsIsZone) {
          currentObject = this.state.objects.find(el => el.name === currentObject.loc)
        }
      }  
      if (currentObject) newObject.loc = currentObject.name
      console.log("Set location to: " + currentObject.name);
    }
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
        label: 'Search for',
        value: this.searchTerm,
        height:150,
        inputAttrs: {
            //type: 'url'
        }
    })
    .then((r) => {
        if(r === null) {
            console.log('user cancelled');
            this.message("Search cancelled")
        } else {
            console.log('result', r);
            this.searchTerm = r
            console.log(r);
            this.searchForObject()
        }
    })
    .catch(console.error);
    //console.log("Searchng for: " + term);
  };
  
  findNext() {
    if (this.searchTerm.length > 0) {
      this.searchForObject()
    }
    else {
      this.find()
    }
  }
    
  
  searchForObject() {
    const currentIndex = this.state.objects.findIndex(el => el.name === this.state.currentObjectName)
    console.log(currentIndex)
    console.log("L=" + this.state.objects.length)
    const regex = new RegExp(this.searchTerm, this.searchCaseSensitive ? undefined : 'i')
    
    let index = currentIndex
    
    while (true) {
      if (this.searchBackwards) {
        index--
        if (index < 0) index = this.state.objects.length - 1
      }
      else {
        index++
        if (index >= this.state.objects.length) index = 0
      }
      console.log(index)
      if (index === currentIndex) {
        this.message(regex.test(this.state.objects[currentIndex].name) ? "Search: No object found (other than this one)" : "Search: No object found")
        return
      }
      const name = this.state.objects[index].name
      if (regex.test(name)) {
        this.showObject(name)
        this.message("Search: Found " + name)
        return
      }
    }
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
    this.setValue("jsCollapsed", !obj.jsCollapsed, obj);
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















