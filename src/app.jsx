import React from 'react';
const prompt = require('electron-prompt');

import {SidePane} from './sidepane';
import {MainPane} from './mainpane';
import {FileStore, Exit} from './filestore';

const FILENAME = 'C:/Users/andyj/Documents/GitHub/QuestJS/game-eg/data.js';
const XML_FILE = 'Blood Witch';



let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = function() {};
const DSPY_SCENERY = 5;






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
      { label: 'Add room', },
      { label: 'Add item', },
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
        label: 'Developer notes',
        click () {
          require('electron').shell.openExternal('https://github.com/ThePix/QEdit/wiki/Developer-Notes');
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
    this.findMenuItem(template, 'Add room').click = () => this.addObject(true);
    this.findMenuItem(template, 'Add item').click = () => this.addObject(false);
    this.findMenuItem(template, 'Delete object').click = () => this.removeObject();
    this.findMenuItem(template, 'Duplicate object').click = () => this.duplicateObject();
    this.findMenuItem(template, 'Show only rooms for exits').click = () => this.toggleOption("showRoomsOnly");
    this.findMenuItem(template, 'Find').click = () => this.find();
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    this.fs = new FileStore(XML_FILE);
    
    this.state = {
      /*objects:[
        { name:"lounge", jsIsRoom:true},
        { name:"player", jsTemplates:["PLAYER"], loc:"lounge"},
        { name:"box", loc:"player", gender:"Other", happy:false, jsContainerType:"Container", },
        { name:"hat", loc:"box", gender:"Other", happy:false, jsIsWearable:true, jsMobilityType:"Takeable"},
        { name:"teapot", desc:"A silly blue teapot.", loc:"lounge"},
        { name:"tiger", desc:"Big and stripey.", jsTemplates:["NPC"], loc:"lounge"},
      ],*/
      objects:this.fs.readFile(),
      currentObjectName: false,
      options: {showRoomsOnly:true, },
    };
    this.controls = [
      {tabName:"Home", tabControls:[
        { name:"name",   type:"text",     default:"unnamed", display:"Name",
          validator:function(value, obj) { return !/^[a-zA-Z_][\w]*$/.test(value); },
          tooltip:"The object's name; this is how it is identified in code. It can only contain letters, digits and underscores; it cannot start with a number.",
        },
        
        { name:"loc",    type:"objects",  default:"---", display:"Location",
          validator:function(value, obj) { return value === obj.name; },
          tooltip:"Where the object is at the start of the game, the room or container. Should usually be blank for rooms (as they are not inside anything).",
        },
        
        { name:"title2", type:"title", display:"Editor settings" },

        { name:"jsColour", type:"text",   default:"blue", display:"Editor colour",  
          tooltip:"Colour of the text in the left pane.",
        },
        
        { name:"jsIsZone", type:"flag",   default:false, display:"Zone?",  
          tooltip:"Zones are a way to group rooms, making it easier to build large maps (in fact, they are just rooms in a different colour).",
          displayIf:function(object) { return object.jsIsRoom; },
        },
        
        { name:"title1", type:"title", display:"Templates", displayIf:function(object) { return !object.jsIsRoom; }, },
        
        { name:"jsMobilityType", type:"select",   default:"Immobile", display:"Mobility",  
          options:["Immobile", "Takeable", "Player", "NPC", "Topic"],
          tooltip:"If the item never moves, it is immobile. If it can be taken by the player or a character, it is takeable.",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        
        { name:"jsContainerType", type:"select",   default:"No", display:"Container/openable",  
          options:["No", "Container", "Surface", "Openable", "Vessel"],
          tooltip:"A container might be a box or chest that perhaps can be opened or locked. A surface can have things put on it; a table or shelf. A door or gate is openable, but you cannot put things inside it. A vessel will hold liquids.",
          displayIf:function(object) { return !object.jsIsRoom && (object.jsMobilityType === "Immobile" || object.jsMobilityType === "Takeable"); },
        },
        
        { name:"jsIsLockable", type:"flag",   default:false, display:"Can this be locked?",
          tooltip:"What it says.",
          displayIf:function(object) { return !object.jsIsRoom && (object.jsContainerType === "Container" || object.jsContainerType === "Openable"); },
        },
        
        { name:"jsIsWearable", type:"flag",   default:false, display:"Wearable?",  
          tooltip:"What it says.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Takeable"; },
        },
        
        { name:"jsIsSwitchable", type:"flag",   default:false, display:"Switchable?",  
          tooltip:"Can the player turn it on and off?",
          displayIf:function(object) { return !object.jsIsRoom && (object.jsMobilityType === "Immobile" || object.jsMobilityType === "Takeable"); },
        },
        
        { name:"jsIsFurniture", type:"flag",   default:false, display:"Furniture?",  
          tooltip:"The player can stand, sit or lie on furniture.",
          displayIf:function(object) { return !object.jsIsRoom && (object.jsMobilityType === "Immobile" || object.jsMobilityType === "Takeable"); },
        },
        
        { name:"jsIsCountable", type:"flag",   default:false, display:"Countable?",  
          tooltip:"An item is countable if there are several of them at a few locations, and they are to be grouped together.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Takeable"; },
        },
        
        { name:"jsIsComponent", type:"flag",   default:false, display:"Component?",  
          tooltip:"An item that is permanently a part of another item.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Immobile"; },
        },
        
      ]},
      {tabName:"Text", tabControls:[
        { name:"desc",   type:"scriptstring", default:"", display:"Description",
          tooltip:"A description of the room.",
          displayIf:function(object) { return object.jsIsRoom; },
        },
        { name:"examine",   type:"scriptstring", default:"", display:"Description",
          tooltip:"A description of the item.",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        { name:"jsComments",   type:"textarea", default:"", display:"Comments",
          tooltip:"Your notes; this will not be part of the game when you publish it.",
        },
      ]},
      {
        tabName:"Exits", 
        displayIf:function(o) { return o.jsIsRoom; }, 
        tabControls:[
          { name:"exits",   type:"exits", default:"", display:"Exits", },
        ]
      },
      { 
        tabName:"Container",
        displayIf:function(o) {return o.jsContainerType === "Container"}, 
        tabControls:[
        ]
      },
      { 
        tabName:"Conversion",
        displayIf:function(o) {return o.jsConversionNotes && o.jsConversionNotes.length > 0}, 
        tabControls:[
          { name:"jsConversionNotes",   type:"todolist", default:"", display:"Conversion Notes", },
        ]
      },
    ];
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

  addObject(isRoom) {
    const newObject = {
      name:(isRoom ? "new_room" : "new_item"),
      jsIsRoom:isRoom,
    };
    if (!isRoom && this.state.currentObjectName) newObject.loc = this.state.currentObjectName;
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
  
  // Checkboxes need their own handler as they use the "checked" property...
  handleCBChange(e) {
    this.setValue(e.target.id, e.target.checked);
  }
  
  treeToggle(obj) {
    this.setValue("jsExpanded", !obj.jsExpanded, obj);
  }
  
  setValue(name, value, obj) {
    console.log("----------------------------");
    console.log(name);
    console.log(value);
    console.log(obj);
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

    console.log("Here1");
    this.setState({
      objects:newObjects, 
      currentObjectName:name === "name" ? value: this.state.currentObjectName,
    });
    console.log("Here2");
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
//

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
        updateExit={this.updateExit.bind(this)}
        showObject={this.showObject.bind(this)}
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















