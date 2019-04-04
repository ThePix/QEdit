import React from 'react';
import {SidePane} from './sidepane';
import {MainPane} from './mainpane';
import {FileStore} from './filestore';

const FILENAME = 'C:/Users/andyj/Documents/GitHub/QuestJS/game/data-test.js';










//import { app, Menu } from 'electron';
const {Menu} = require('electron').remote;

const template = [
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
      { role: 'selectall' }
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
      { role: 'togglefullscreen' }
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
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
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

    this.findMenuItem(template, 'Add room').click = () => this.addObject(true);
    this.findMenuItem(template, 'Add item').click = () => this.addObject(false);
    this.findMenuItem(template, 'Delete object').click = () => this.removeObject();
    this.findMenuItem(template, 'Duplicate object').click = () => this.duplicateObject();
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    const fs = new FileStore(FILENAME);

    this.state = {
      /*objects:[
        { name:"lounge", jsIsRoom:true},
        { name:"player", jsTemplates:["PLAYER"], loc:"lounge"},
        { name:"box", loc:"player", gender:"Other", happy:false, jsContainerType:"Container", },
        { name:"hat", loc:"box", gender:"Other", happy:false, jsIsWearable:true, jsMobilityType:"Takeable"},
        { name:"teapot", desc:"A silly blue teapot.", loc:"lounge"},
        { name:"tiger", desc:"Big and stripey.", jsTemplates:["NPC"], loc:"lounge"},
      ],*/
      objects:fs.readFile(),
      currentObjectName: false,
    };
    this.controls = [
      {tabName:"Home", tabControls:[
        { name:"name",   type:"text",     tab:0, default:"unnamed", display:"Name",
          tooltip:"The object's name; this is how it is identified in code. It can only contain letters, digits and underscores; it cannot start with a number.",
        },
        
        { name:"loc",    type:"objects",  tab:0, default:"---", display:"Location",
          tooltip:"Where the object is at the start of the game, the room or container. Should usually be blank for rooms (as they are not inside anything).",
        },
        
        { name:"jsMobilityType", type:"select",   tab:0, default:"Immobile", display:"Mobility",  
          options:["Immobile", "Takeable", "Player", "NPC"],
          tooltip:"If the item never moves, it is immobile. If it can be taken by the player or a character, it is takeable",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        
        { name:"jsContainerType", type:"select",   tab:0, default:"No", display:"Container/openable",  
          options:["No", "Container", "Surface", "Openable", "Vessel"],
          tooltip:"A container might be a box or chest that perhaps can be opened or locked. A surface can have things put on it; a table or shelf. A door or gate is openable, but you cannot put things inside it. A vessel will hold liquids.",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        
        { name:"jsIsLockable", type:"flag",   tab:0, default:false, display:"Can this be locked?",
          tooltip:"What it says.",
          displayIf:function(object) { return !object.jsIsRoom && (object.jsContainerType === "Container" || object.jsContainerType === "Openable"); },
        },
        
        { name:"jsIsWearable", type:"flag",   tab:0, default:false, display:"Can this be worn?",  
          tooltip:"What it says.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Takeable"; },
        },
        
        { name:"jsIsSwitchable", type:"flag",   tab:0, default:false, display:"Switchable?",  
          tooltip:"Can the player tirn it on and off?",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        
        { name:"jsIsFurniture", type:"flag",   tab:0, default:false, display:"Is it furniture?",  
          tooltip:"The player can stand, sit or lie on furniture.",
          displayIf:function(object) { return !object.jsIsRoom; },
        },
        
        { name:"jsIsCountable", type:"flag",   tab:0, default:false, display:"Countable?",  
          tooltip:"An item is countable if there are several of them at a few locations, and they are to be grouped together.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Takeable"; },
        },
        
        { name:"jsIsComponent", type:"flag",   tab:0, default:false, display:"Component?",  
          tooltip:"An item that is permanently a part of another item.",
          displayIf:function(object) { return !object.jsIsRoom && object.jsMobilityType === "Immobile"; },
        },
        
        { name:"age",    type:"number",   tab:0, default:18, display:"Age",
          tooltip:"The object's age.",
        },
        
        { name:"happy",  type:"flag",     tab:0, default:true, display:"Happy?",
          tooltip:"Is the object happy?",
        },
      ]},
      {tabName:"Text", tabControls:[
        { name:"jsComments",   type:"textarea", tab:0, default:"", display:"Comments",
          tooltip:"Your notes; this will not be part of the game (but is saved as a JavaScript comment).",
        },
        { name:"desc",   type:"textarea", tab:1, default:"", display:"Description",
          tooltip:"A description of the object.",
        },
      ]},
      {
        tabName:"Exits", 
        displayIf:function(o) {
          return o.jsIsRoom;
        }, 
        tabControls:[
        ]
      },
      { 
        tabName:"Container",
        displayIf:function(o) {return o.jsContainerType === "Container"}, 
        tabControls:[
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
    if (!isRoom) loc = this.state.currentObjectName;
    this.setDefaults(newObject);
      
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
  
  // remove on eitem from an attribute that is an array of strings
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
  
  // remove on eitem from an attribute that is an array of strings
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
    for (let j = 0; j < this.controls.length; j++) {
      if (o[this.controls[j].name] === undefined) {
        o[this.controls[j].name] = this.controls[j].default;
      }
    }
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
  
  setValue(name, value, index) {
    console.log("changing " + name + " to " + value + ".");
    if (name === "name") {
      if (!/^[a-zA-Z_][\w]*$/.test(value)) return;
    }
    const control = this.controls.find(el => el.name === name);
    const newObjects = JSON.parse(JSON.stringify(this.state.objects)); // cloning the state
    
    // Need to look in new list for old name, as the name may be changing
    const currentObject = newObjects.find(el => {
      return (el.name == this.state.currentObjectName);
    });
    
    currentObject[name] = value;
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
        addToList={this.addToList.bind(this)} 
        handleCBChange={this.handleCBChange.bind(this)} 
        controls={this.controls}
        objects={this.state.objects} 
        warning={this.nameTest(this.state.currentObjectName)}
      />
      <SidePane 
        objects={this.state.objects} 
        showObject={this.showObject.bind(this)} 
        addObject={this.addObject.bind(this)}
      />
    </div>);
  }
  
}















