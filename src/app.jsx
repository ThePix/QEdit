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

  // Used to set up the menus during set up
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
    let docs = fs.existsSync(homedir + slash + 'Documents') ? 'Documents' : ''
    if (docs === '') docs = fs.existsSync(homedir + slash + 'My Documents') ? 'My Documents' : ''
    let gamePath = docs != '' ? homedir + slash + docs : homedir
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
    //console.log("autosave . . .")
    //console.log(new Date())
    //console.log("interval:")
    //console.log(interval)
    if (interval && interval !== 0) {
      setTimeout(this.autosave.bind(this), interval * 60000)
    }
  }

  saveGame(filename) {
    filename = typeof(filename) === 'string' ? filename : this.questObjects.getFilename()
    //console.log(filename)
    if (filename) {
      const result = FileStore.writeASLFile(this.questObjects.getObjects(), filename)
      //console.log(result)
      this.message(result)
    }
    else {
      this.saveGameAs()
    }
    //console.log("Ran saveGame ", new Date())
  }

  saveGameAs() {
    let slash = platform === 'win32' ? '\\' : '/'
    let docs = fs.existsSync(homedir + slash + 'Documents') ? 'Documents' : ''
    if (docs === '') docs = fs.existsSync(homedir + slash + 'My Documents') ? 'My Documents' : ''
    let gamePath = docs != '' ? homedir + slash + docs : homedir
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
    //console.log(filename)
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
      window.alert('Save your game before exporting!')
      //console.log('Save your game before exporting')
      this.message('Save your game before exporting')
      return
    }

    const result = FileStore.writeJSFile(this.questObjects.questObjects, filename)
    //console.log(result)
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
    //console.log(this.state)
    global.app = this  // This lets you access this from the console in the editor!
    
    // Add right-clicking.
      // NOTE FROM KV: This app does not have real jQuery (as far as I can tell)
    function getEl(el){
      return window.document.getElementById(el);
    }
    const { remote } = require('electron')
    const { Menu, MenuItem } = remote
    const menu = new Menu()
    menu.append(new MenuItem({ role: 'selectAll' }))
    menu.append(new MenuItem({ role: 'copy' }))
    menu.append(new MenuItem({ role: 'paste' }))
    menu.append(new MenuItem({ type: 'separator' }))
    menu.append(new MenuItem({ role: 'toggleDevTools' }))
    menu.append(new MenuItem({ label: 'Toggle Blockly (EXPERIMENTAL)', click:() => {
      let of = window.document.getElementsByTagName('body')[0].style.overflow
      window.document.getElementsByTagName('body')[0].style.overflow = of === 'hidden' ? 'auto' : 'hidden'
      getEl('blocklyDiv').style.display = of === 'hidden' ? 'block' : 'none'
      getEl('textarea').style.display = of === 'hidden' ? 'block' : 'none'
      if (of === 'hidden') {
        window.alert("Scroll down for Blockly!\n\n(It's not worth much yet.)")
      }
    }}))
    menu.append(new MenuItem({label: 'Object',
    submenu: [
      { label: 'Add location', accelerator: 'CmdOrCtrl+L', click:() => {
        this.questObjects.addObject(Constants.ROOM_TYPE)
      }},
      { label: 'Add item', accelerator: 'CmdOrCtrl+I',click:() => {
        this.questObjects.addObject(Constants.ITEM_TYPE)
      }},
      { label: 'Add stub', click:() => {
        this.questObjects.addObject(Constants.STUB_TYPE)
      }},
      { type: 'separator' },
      { label: 'Add function', accelerator: 'Alt+CmdOrCtrl+F', click:() => {
        this.questObjects.addObject(Constants.FUNCTION_TYPE)
      }},
      { label: 'Add command', accelerator: 'Alt+CmdOrCtrl+C',click:() => {
        this.questObjects.addObject(Constants.COMMAND_TYPE)
      }},
      { label: 'Add template', accelerator: 'Alt+CmdOrCtrl+T', click:() => {
        this.questObjects.addObject(Constants.TEMPLATE_TYPE)
      }},
    ]}))
    
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      menu.popup({ window: remote.getCurrentWindow() })
    }, false)

    //Blockly
    const Blockly = require('../node_modules/blockly/node')

    // Define msg block ( https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#kdfkh6 )
    Blockly.Blocks['msg'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("msg");
        this.appendValueInput("s")
            .setCheck(["String", "jsobject"])
            .appendField("s");
        this.appendValueInput("params")
            .setCheck("jsobject")
            .appendField("params (opt)");
        this.appendValueInput("cssClass")
            .setCheck(["String", "jsobject"])
            .appendField("cssClass (opt)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
     this.setTooltip("Accepts a string (plus optional options arg).  Prints a string in the game.");
     this.setHelpUrl("https://github.com/ThePix/QuestJS/wiki/Printing-Text#the-msg-functions");
      }
    };

    
    // Create msg block stub
    Blockly.JavaScript['msg'] = function(block) {
      var value_s = Blockly.JavaScript.valueToCode(block, 's', Blockly.JavaScript.ORDER_ATOMIC);
      var value_params = Blockly.JavaScript.valueToCode(block, 'params', Blockly.JavaScript.ORDER_ATOMIC);
      var value_cssclass = Blockly.JavaScript.valueToCode(block, 'cssClass', Blockly.JavaScript.ORDER_ATOMIC);
      // Assemble JavaScript into code.
      var code = ''
      if (value_s) {
        code += 'msg(' + value_s
      } else {
        return code
      }
      code += value_params ?  ', ' + value_params : ', null'
      code += value_cssclass ? ', ' + value_cssclass : ''
      code += ');\n'
      return code
    };

    // Create 'return' block
    Blockly.Blocks['return'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("return");
        this.appendValueInput("s")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
     this.setTooltip("Returns the value.");
     this.setHelpUrl("");
      }
    };

    // Create 'return' block stub
    Blockly.JavaScript['return'] = function(block) {
      var value_s = Blockly.JavaScript.valueToCode(block, 's', Blockly.JavaScript.ORDER_ATOMIC);
      var code = 'return ' + value_s + ';\n';
      return code;
    };

    // Add blocks to page
    let workspace = Blockly.inject('blocklyDiv',
      {toolbox: window.document.getElementById('toolbox')});

    // Function to update the textarea target to output the code rendered
    function myUpdateFunction(event) {
      let code = Blockly.JavaScript.workspaceToCode(workspace);
      getEl('textarea').value = code;
    }

    // Add listener to the Blockly workspace
    workspace.addChangeListener(myUpdateFunction);

   // Setup custom prompt and alert for Blockly (prompt will not work in an Electron app).
   let  CustomDialog = {};

    /** Override Blockly.alert() with custom implementation. */
    Blockly.alert = function(message, callback) {
      console.log('Alert: ' + message);
      CustomDialog.show('Alert', message, {
        onCancel: callback
      });
    };

    /** Override Blockly.confirm() with custom implementation. */
    Blockly.confirm = function(message, callback) {
      console.log('Confirm: ' + message);
      CustomDialog.show('Confirm', message, {
        showOkay: true,
        onOkay: function() {
          callback(true);
        },
        showCancel: true,
        onCancel: function() {
          callback(false);
        }
      });
    };

    /** Override Blockly.prompt() with custom implementation. */
    Blockly.prompt = function(message, defaultValue, callback) {
      console.log('Prompt: ' + message);
      CustomDialog.show('Prompt', message, {
        showInput: true,
        showOkay: true,
        onOkay: function() {
          callback(CustomDialog.inputField.value);
        },
        showCancel: true,
        onCancel: function() {
          callback(null);
        }
      });
      CustomDialog.inputField.value = defaultValue;
    };

    /** Hides any currently visible dialog. */
    CustomDialog.hide = function() {
      if (CustomDialog.backdropDiv_) {
        CustomDialog.backdropDiv_.style.display = 'none';
        CustomDialog.dialogDiv_.style.display = 'none';
      }
    };

    /**
     * Shows the dialog.
     * Allowed options:
     *  - showOkay: Whether to show the OK button.
     *  - showCancel: Whether to show the Cancel button.
     *  - showInput: Whether to show the text input field.
     *  - onOkay: Callback to handle the okay button.
     *  - onCancel: Callback to handle the cancel button and backdrop clicks.
     */
    CustomDialog.show = function(title, message, options) {
      var backdropDiv = CustomDialog.backdropDiv_;
      var dialogDiv = CustomDialog.dialogDiv_;
      if (!dialogDiv) {
        // Generate HTML
        backdropDiv = window.document.createElement('div');
        backdropDiv.id = 'customDialogBackdrop';
        backdropDiv.style.cssText =
            'position: absolute;' +
            'top: 0; left: 0; right: 0; bottom: 0;' +
            'background-color: rgba(0, 0, 0, .7);' +
            'z-index: 100;';
            window.document.body.appendChild(backdropDiv);

        dialogDiv = window.document.createElement('div');
        dialogDiv.id = 'customDialog';
        dialogDiv.style.cssText =
            'background-color: #fff;' +
            'width: 400px;' +
            'margin: 20px auto 0;' +
            'padding: 10px;';
        backdropDiv.appendChild(dialogDiv);

        dialogDiv.onclick = function(event) {
          event.stopPropagation();
        };

        CustomDialog.backdropDiv_ = backdropDiv;
        CustomDialog.dialogDiv_ = dialogDiv;
      }
      backdropDiv.style.display = 'block';
      dialogDiv.style.display = 'block';

      dialogDiv.innerHTML =
          '<header class="customDialogTitle"></header>' +
          '<p class="customDialogMessage"></p>' +
          (options.showInput ? '<div><input id="customDialogInput"></div>' : '') +
          '<div class="customDialogButtons">' +
          (options.showCancel ? '<button id="customDialogCancel">Cancel</button>': '') +
          (options.showOkay ? '<button id="customDialogOkay">OK</button>': '') +
          '</div>';
      dialogDiv.getElementsByClassName('customDialogTitle')[0]
          .appendChild(window.document.createTextNode(title));
      dialogDiv.getElementsByClassName('customDialogMessage')[0]
          .appendChild(window.document.createTextNode(message));

      var onOkay = function(event) {
        CustomDialog.hide();
        options.onOkay && options.onOkay();
        event && event.stopPropagation();
      };
      var onCancel = function(event) {
        CustomDialog.hide();
        options.onCancel && options.onCancel();
        event && event.stopPropagation();
      };

      var dialogInput = window.document.getElementById('customDialogInput');
      CustomDialog.inputField = dialogInput;
      if (dialogInput) {
        dialogInput.focus();

        dialogInput.onkeyup = function(event) {
          if (event.keyCode == 13) {
            // Process as OK when user hits enter.
            onOkay();
            return false;
          } else if (event.keyCode == 27)  {
            // Process as cancel when user hits esc.
            onCancel();
            return false;
          }
        };
      } else {
        var okay = window.document.getElementById('customDialogOkay');
        okay && okay.focus();
      }

      if (options.showOkay) {
        window.document.getElementById('customDialogOkay')
            .addEventListener('click', onOkay);
      }
      if (options.showCancel) {
        window.document.getElementById('customDialogCancel')
            .addEventListener('click', onCancel);
      }

      backdropDiv.onclick = onCancel;
    };
    // BLOCKLY ends

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
