import React, {Component} from 'react'
import SplitPane from 'react-split-pane'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFolder, faFileAlt, faLocationArrow, faSlidersH, faSeedling, faCode, faTerminal, faClone } from '@fortawesome/free-solid-svg-icons'
import * as Constants from './constants'


library.add(faFolder, faFileAlt, faLocationArrow, faSlidersH, faSeedling, faCode, faTerminal, faClone);

//import Blockly from 'blockly/blockly_compressed';

const prompt = require('electron-prompt');
const {Menu, dialog, app} = require('electron').remote;

import {SidePane} from './sidepane';
import {MainPane} from './mainpane';
import FileStore from './filestore';
import Preferences from './preferences'
//import {TabControls} from './tabcontrols';
import {Menus} from './menus';
import TabControls from './tabcontrols'
import QuestObjects from './questobjects'

// Next four lines disable warning from React-hot-loader
import { hot, setConfig } from 'react-hot-loader'
setConfig({
    showReactDomPatchNotification: false
})

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;


const useWithDoor = function() {};
const DSPY_SCENERY = 5;
const template = new Menus().getMenus();

const newOptions  = {
  buttons: ["Yes", "No"],
  message: "Do you really want to start a new game?",
  detail:'Any unsaved work will be lost.',
  type:'warning',
}


export default class App extends Component {
  constructor(props) {
    super(props)

    this.searchTerm = ''
    this.searchBackwards = false
    this.searchCaseSensitive = true
    this.controls = new TabControls().controls;
    this.preferences = new Preferences()
    this.questObjects = new QuestObjects(this.controls, this.preferences)

    const menuMapping = {
      'New':           () => this.newGame(),
      'Open...':       () => this.openGame(),
      'Save':          () => this.saveGame(),
      'Save As...':    () => this.saveGameAs(),
      'Export to JavaScript': () => this.exportGame(),

      'Preferences...': () => this.preferences.showPreferences(),

      'Add location':  () => this.questObjects.addObject(Constants.ROOM_TYPE),
      'Add item':      () => this.questObjects.addObject(Constants.ITEM_TYPE),
      'Add stub':      () => this.questObjects.addObject(Constants.STUB_TYPE),
      'Add function':  () => this.questObjects.addObject(Constants.FUNCTION_TYPE),
      'Add command':   () => this.questObjects.addObject(Constants.COMMAND_TYPE),
      'Add template':  () => this.questObjects.addObject(Constants.TEMPLATE_TYPE),
      'Delete object': () => this.questObjects.removeObject(),
      'Duplicate object': () => this.questObjects.duplicateObject(),

      'Find': () => this.find(),
      'Find next': () => this.findNext(),
      'Search backwards': () => this.searchBackwards = !this.searchBackwards,
      'Search case sensitive': () => this.searchCaseSensitive = !this.searchCaseSensitive,

    }

    if (process.platform !== 'darwin') {
      menuMapping.Exit = () => app.quit()
    }

    for (let key in menuMapping) {
      this.findMenuItem(template, key).click = menuMapping[key]
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)



    const _this = this
    window.addEventListener('load', function(e) {
      _this.message("All good to go...")
      setTimeout(_this.autosave.bind(_this), 300000)
    })

  }

  // Used to set upo the menus during set up
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



  //---------------------------
  //--      FILE  SYSTEM    ---

  newGame() {
    const response = dialog.showMessageBox(newOptions)
    if (response === 0) {
      this.questObjects.clear()
      this.message("New game")
    }
    else {
      this.message("New game cancelled")
    }
  }

  openGame() {
    const dialogOptions = {
      //defaultPath: "c:/",
      filters: [
        { name: "Quest files", extensions: Constants.FILEEXTENSIONS },
        { name: "All Files", extensions: ["*"] },
      ],
      properties: ["openFile"],
      title: 'Open file',
    };
    const result = dialog.showOpenDialog(dialogOptions)
    console.log(result);
    if (result) {
      this.questObjects.load(result[0])
      this.message("Opened: " + result[0]);
    }
    else {
      this.message("Open file cancelled");
    }
  }

  autosave() {
    if (this.autosaveCount === undefined) this.autosaveCount = -1
    this.autosaveCount++
    if (this.autosaveCount > 9) this.autosaveCount = 0
    var autosavePath = app.getPath('userData') + '/autosaves/'
    var autosaveFile = 'autosave' + this.autosaveCount + Constants.EXTENSION_ASL6
    this.saveGame(autosavePath + autosaveFile)
    if (this.preferences.jsAutosaveInterval !== 0) {
      setTimeout(this.autosave.bind(this), this.preferences.jsAutosaveInterval * 60000)
    }
  }

  saveGame(filename) {
    filename = filename || this.questObjects.getFilename()

    if (filename) {
      const result = FileStore.writeASLFile(this.questObjects.getObjects(), filename)
      console.log(result)
      this.message(result)
    }
    else {
      this.saveGameAs()
    }
  }

  saveGameAs() {
    const dialogOptions = {
      //defaultPath: "c:/",
      filters: [
        { name: "Quest files", extensions: Constants.FILEEXTENSIONS },
        { name: "All Files", extensions: ["*"] },
      ],
      title: 'Save file',
    }
    const filename = dialog.showSaveDialog(dialogOptions)
    console.log(filename)
    if (filename) {
      this.questObjects.setFilename(filename)
      this.saveGame(filename)
    }
    else {
      this.message("Save as file cancelled")
    }
  }

  exportGame(filename) {
    this.saveGame(filename) // make sure this is saved to asl6 first
    filename = this.questObjects.getFilename()
    if (!filename) {
      console.log('Save your game before exporting')
      this.message('Save your game before exporting')
      return
    }

    const result = FileStore.writeJSFile(this.questObjects.getObjects(), filename)
    console.log(result)
    this.message(result)
  }


  toggleOption(name) {
    console.log("Toggling " + name)
    this.state.options[name] = !this.state.options[name];
    this.setState({
      options: this.state.options
    })
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

// TODO: This needs to be moved?
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
        this.questObjects.setCurrentObject(name)
        this.message("Search: Found " + name)
        return
      }
    }
  };
/*
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
*/


  handleChange(e) {
    console.log(e.target.dataset)
    this.questObjects.setValue(e.target.id, e.target.value);
  }
/*
  // id needs its own handler so it gets tested properly for uniqueness
  handleIdChange(e) {
    console.log("------------------")
    if (!/^[a-zA-Z_][\w]*$/.test(e.target.value)) return


    this.questObjects.setValue(e.target.id, e.target.value, {id:true, type:'id'});
  }
*/
  // numbers need their own handler so they get converted to numbers
  handleIntChange(e) {
    const value = parseInt(e.target.value)
    if (e.target.min && value < e.target.min) return
    if (e.target.max && value > e.target.max) return
    this.questObjects.setValue(e.target.id, value);
  }

  // numbers need their own handler so they get converted to numbers
  handleListChange(e) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    this.questObjects.setValue(e.target.id, e.target.value.split(/\r?\n/), {id:true, type:'stringlist'});
  }

  // Checkboxes need their own handler as they use the "checked" property...
  handleCBChange(e) {
    console.log(e.target.dataset.default);

    if (e.target.dataset.default !== 'nodefault') {
      this.questObjects.setValue(e.target.id, e.target.dataset.default);
    }
    this.questObjects.setValue(e.target.id, e.target.checked);

  }


  render() {
    console.log(this.state)

//    return (<div id='main' className={preferences.get(darkMode) ? 'dark' : 'light'}>
//                darkMode={this.state.options.darkMode} in sidepane

    return (<div id='main' className='light'>
      <Preferences />
      <SplitPane split="horizontal" allowResize={false} defaultSize={42}>
        <div id="toolbar">Buttons appear here...</div>
        <SplitPane split="horizontal" allowResize={false} defaultSize={18} primary="second">
          <SplitPane split="vertical" defaultSize={200} minSize={50}>
            <SidePane objects={this.questObjects} />
            <MainPane
              objects={this.questObjects}
              handleChange={this.handleChange.bind(this)}
              handleCBChange={this.handleCBChange.bind(this)}
              handleIntChange={this.handleIntChange.bind(this)}
              handleListChange={this.handleListChange.bind(this)}
              controls={this.controls}
            />
          </SplitPane>
          <div id="statusbar">Status:</div>
        </SplitPane>
      </SplitPane>
    </div>);
  }
}
