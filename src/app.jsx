import React from 'react'
import { Container, Content } from 'rsuite'
import * as Constants from './constants'
import SidePane from './sidepane'
import MainPane from './mainpane'
import FileStore from './filestore'
import Preferences from './preferences'
import Menus from './menus'
import QuestObjects from './questobjects'
import Toolbar from './toolbar'

//import Blockly from 'blockly/blockly_compressed';

const prompt = require('electron-prompt')
const {Menu, dialog, app} = require('electron').remote
const homedir = require('os').homedir()
const platform = require('os').platform()
const arch = require('os').arch()
const fs = require('fs')



// Next four lines disable warning from React-hot-loader
import { hot, setConfig } from 'react-hot-loader'
setConfig({
    showReactDomPatchNotification: false
})

window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;


const template = new Menus().getMenus();

const newOptions  = {
  buttons: ["Yes", "No"],
  message: "Do you really want to start a new game?",
  detail:'Any unsaved work will be lost.',
  type:'warning',
}

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showPreferences: false
    }

    this.searchTerm = ''
    this.searchBackwards = false
    this.searchCaseSensitive = true
    this.questObjects = new QuestObjects()

    const menuMapping = {
      'New':           () => this.newGame(),
      'Open...':       () => this.openGame(),
      'Save':          () => this.saveGame(),
      'Save As...':    () => this.saveGameAs(),
      'Export to JavaScript': () => this.exportGame(),

      'Preferences...': () => this.openPreferences(),

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

    this.closePreferences = this.closePreferences.bind(this)
    this.newGame = this.newGame.bind(this)
    this.openGame = this.openGame.bind(this)
    this.saveGame = this.saveGame.bind(this)
    this.find = this.find.bind(this)
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
//    document.getElementById('statusbar').innerHTML = "Status: <i>" + s + "</i>";
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
    let slash = platform === 'win32' ? '\\' : '/'
    let gamePath = fs.existsSync(homedir + slash + 'Documents') ? homedir + slash + 'Documents' : homedir
    
    gamePath += slash + 'quest_games'
    //console.log(gamePath)
    if (!fs.existsSync(gamePath)) {
      console.log('Folders need creating')
      fs.mkdirSync(gamePath, { recursive: true })
    } 
    const dialogOptions = {
      defaultPath: gamePath,
      filters: [
        { name: "Quest files", extensions: Constants.FILEEXTENSIONS },
        { name: "All Files", extensions: ["*"] },
      ],
      properties: ["openFile"],
      title: 'Open file',
    }
    const result = dialog.showOpenDialog(dialogOptions)
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
    var autosaveFile = 'autosave' + this.autosaveCount + '.' + Constants.EXTENSION_ASL6
    this.saveGame(autosavePath + autosaveFile)
    const interval = global.AUTOSAVEINTERVAL
    console.log("autosave . . .")
    console.log(new Date())
    console.log("interval:")
    console.log(interval)
    if (interval && interval !== 0) {
      setTimeout(this.autosave.bind(this), interval * 60000)
    }
  }

  saveGame(filename) {
    filename = filename || this.questObjects.getFilename()

    if (filename) {
      const result = FileStore.writeASLFile(this.questObjects.getObjects(), filename)
      //console.log(result)
      this.message(result)
    }
    else {
      this.saveGameAs()
    }
    console.log("Ran saveGame ", new Date())
  }

  saveGameAs() {
    let slash = platform === 'win32' ? '\\' : '/'
    let gamePath = fs.existsSync(homedir + slash + 'Documents') ? homedir + slash + 'Documents' : homedir
    
    gamePath += slash + 'quest_games'
    //console.log(gamePath)
    if (!fs.existsSync(gamePath)) {
      console.log('Folders need creating')
      fs.mkdirSync(gamePath, { recursive: true })
    }
    const dialogOptions = {
      defaultPath:gamePath,
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
    filename = this.questObjects.getFilename()
    this.saveGame(filename) // make sure this is saved to asl6 first
    
    if (!filename) {
      console.log('Save your game before exporting')
      this.message('Save your game before exporting')
      return
    }

    const result = FileStore.writeJSFile(this.questObjects.getObjects(), filename)
    console.log(result)
    this.message(result)
  }

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

// TODO: This needs to be moved? To questobjects
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
  }

  openPreferences() {
    this.setState({showPreferences: true})
  }

  closePreferences() {
    this.setState({showPreferences: false})
  }

  render() {
    console.log(this.state)
    return (
      <Container>
        <Preferences
          show={this.state.showPreferences}
          close={this.closePreferences}
        />
        <Toolbar
          objects={this.questObjects}
          newGame={this.newGame}
          openGame={this.openGame}
          saveGame={this.saveGame}
          search={this.find}
        />
        <Content>
          <Container>
            <SidePane objects={this.questObjects} />
            <MainPane objects={this.questObjects} />
          </Container>
        </Content>
      </Container>
    )
// TODO: Implent darkMode
  }
}
