'use strict'

const useWithDoor = "useWithDoor";
const DSPY_SCENERY = 5;
const QUEST_JS_PATH = '../questjs/'

//let nextId = 0

const [TabControls] = require('./tabcontrols')
const {lang} = require(QUEST_JS_PATH + "lang/lang-en")
const {settings} = require(QUEST_JS_PATH + "lib/settings")

const ALT_COLOURS = {
  blue:'lightblue',
  black:'white',
}

class QuestObject {
  constructor (data, version) {
    //this.id = nextId
    //nextId++
    if (data.getAttribute) {
      // Is this an XML element? We could test if the class is Element, but then the unit tests fails
      this.translateObjectFromXml(data, version);
    }
    else {
      for (let key in data) {
        this[key] = data[key]
      }
    }
  }

  static getSettings(state) {
    return state.objects.find(el => el.jsObjType === 'settings')
  }

  static getByName(state, name) {
    return state.objects.find(el => el.name === name)
  }

  static getCurrent(state) {
    return state.objects.find(el => el.name === state.currentObjectName)
  }

  static getById(state, id) {
    return state.objects.find(el => el.id === id)
  }

  static create(state, objectType) {
    var newObject = new QuestObject({
      name:"_new_" + objectType,
      jsObjType:objectType,
      jsMobilityType:'Immobile',
    });
    newObject.makeUniqueName(state)
    console.log("objectType=" + objectType);

    const settings = QuestObject.getSettings(state)
    let currentObject = QuestObject.getCurrent(state)
    // If the current object is the settings, OR if the current object is a room and new rooms go top,
    // then loc is undefined, otherwise, do this:
    if (currentObject.jsObjType === 'settings' || newObject.jsObjType === 'junction' || newObject.jsObjType === 'command') {
      currentObject = undefined
    }
    else {
      if (newObject.jsObjType === 'room') {
        if (settings.jsNewRoomWhere === "Top") {
          currentObject = undefined
        }
        else if (settings.jsNewRoomWhere === "Location") {
          console.log("Looking for room");
          while (currentObject && !currentObject.jsObjType === 'room') {
            currentObject = state.objects.find(el => el.name === currentObject.loc)
          }
        }
        else if (settings.jsNewRoomWhere === "Zone") {
          console.log("Looking for zone");
          while (currentObject && !currentObject.jsIsZone) {
            currentObject = state.objects.find(el => el.name === currentObject.loc)
          }
        }
      }
      else {
        if (settings.jsNewItemWhere === "Top") {
          currentObject = undefined
        }
        else if (settings.jsNewItemWhere === "Location") {
          console.log("Looking for room");
          while (currentObject && !currentObject.jsObjType === 'room') {
            currentObject = state.objects.find(el => el.name === currentObject.loc)
          }
        }
        else if (settings.jsNewItemWhere === "Zone") {
          console.log("Looking for zone");
          while (currentObject && !currentObject.jsIsZone) {
            currentObject = state.objects.find(el => el.name === currentObject.loc)
          }
        }
      }
    }
    if (currentObject) {
      newObject.loc = currentObject.name
      console.log("Set location to: " + currentObject.name);
    }
    if (newObject.jsObjType === 'command') {
      newObject.jsIsCommand = true
    }

    return newObject
  }





  makeUniqueName(state) {
    console.log('here')
    // Is it already unique?
    if (!state.objects.find(el => (el.name === this.name && el !== this))) return
    console.log('not unique')

    const res = /(\d+)$/.exec(this.name);
    // Does not end in a number
    if (!res) {
      this.name += '0'
    }
    else {
      const n = parseInt(res[0]) + 1;
      console.log(n)
      this.name = this.name.replace(/(\d+)$/, "" + n)
    }
    this.makeUniqueName(state)
  }


  //---------------------------------------------------------------------
  //----------           For React                  ---------------------

  addDefaults(controls) {
    for (let i = 0; i < controls.length; i++) {
      if (this.displayIf(controls[i])) {
        for (let j = 0; j < controls[i].tabControls.length; j++) {
          const tabControl = controls[i].tabControls[j]
          if (this.displayIf(tabControl) && this[tabControl.name] === undefined) {
            this[tabControl.name] = tabControl.default;
          }
        }
      }
    }
  }

  getCurrentTab(controls) {
    let tab = (this.jsTabName ? this.jsTabName : controls[0].tabName);
    let control = controls.find(el => el.tabName === tab);

    if (!control) console.log("Failed to find control: " + tab);
    if (!this.displayIf(control)) {
      control = controls.find(el => {return this.displayIf(el);} );
    }
    if (control === undefined) {
      console.log("Still not found a suitable default tab, so just going with zero");
      control = controls[0];
    }
    this.jsTabName = control.tabName
    return control;
  }

  displayIf(control) {
    if (!control.displayIf) return true;
    try {
      const o = this;
      return eval(control.displayIf);
    }
    catch (err) {
      console.log("------------------------------");
      console.log("Error in displayIf");
      console.log(err.message);
      console.log(this.name);
      console.log(control.displayIf);
    }
  }

  treeStyleClass() {
    if (this.jsObjType === 'settings') {
      return "treeSettings";
    }
    else if (this.jsObjType === 'room') {
      return this.jsIsZone ? "treeZone" : "treeRoom";
    }
    else {
      return this.jsObjType === 'stub' ? "treeStub" : "treeItem";
    }
  }

  uiColour(darkMode) {
    let colour = this.jsColour || 'blue'
    if (darkMode && ALT_COLOURS[colour]) colour = ALT_COLOURS[colour]
    return colour
  }



  //---------------------------------------------------------------------
  //------------------  IMPORT FUNCTIONS  -------------------------

  // Used by readFile via the constructor to create one object from its XML
  // which could be Quest 5 or 6
  // This has been unit tested with Quest 5 XML for an NPM, a wearable and a room
  // For Quest 6 the different types of attributes have been tested
  translateObjectFromXml(xml, version) {

    const object = {};
    this.jsConversionNotes = [];

    this.name = xml.getAttribute('name');
    if (/ /.test(this.name)) {
      this.jsConversionNotes.push("Object name had spaces removed; update any references (locations have been updates automatically); check no naming collision.");
      this.jsOldName = this.name;
      this.name = this.name.replace(/ /, "_");
    }


    // Parent -> loc
    if (xml.parentNode.nodeType === 1) {
      //console.log("Parent is: " + xml.parentNode.tagName);
      if (xml.parentNode.tagName === 'object') {
        this.loc = xml.parentNode.getAttribute('name');
        //console.log("Added parent: " + xml.parentNode.getAttribute('name'));
      }
    }

    // Attributes
    for (let node of  xml.childNodes) {
      if (node.nodeType === 1 && node.tagName !== 'object') {
        const attType = node.getAttribute('type');
        const value = node.innerHTML;
        const name = (node.tagName === "attr" ? node.getAttribute('name') : node.tagName);

        if (name === "inherit") {
          this.inherit = this.inherit || []
          this.inherit.push(node.getAttribute('name'))
        }
        else if (attType === 'boolean') {
          this[name] = value === 'true' || value === ''
          //console.log("Boolean");
        }
        else if (attType === 'int') {
          this[name] = parseInt(value);
          //console.log("Int");
        }
        else if (attType === 'regex') {
          this[name] = new RegExp(value);
          //console.log("RegExp");
        }
        else if (attType === 'stringlist') {
          const els = node.getElementsByTagName('value')
          const arr = [];
          for (let k = 0; k < els.length; k++) arr.push(els[k].innerHTML);
          this[name] = arr;
          //console.log("stringlist for " + object.name);
        }
        else if (['script', 'js', 'blockly'].includes(attType)) {
          //console.log("Code " + attType);
          //console.log(value);
          this[name] = xmlToDict(node, {type:attType})
        }
        else if (name === 'exit') {
          this[node.getAttribute('alias')] = Exit.createFromXml(node);
          //console.log("Exit");
        }
        else if ((value === '' || value === undefined) && node.attributes.length === 0) {
          this[name] = true;
        }
        else if (attType === 'string' || attType === '' || attType === null || attType === 'object') {
          this[name] = removeBR(removeCDATA(value));
        }
        else {
          this[name] = value;
          this.jsConversionNotes.push("Attribute type '" + attType + "' not recognised; attribute may not have been converted properly: " + name);
        }
      }
    }

    // If this is a conversion from Quest 5 we need to handle the "inherit"
    // elements, which correspond approximately to templates
    if (version < 600) {
      this.inherit = this.inherit|| []
      if (xml.tagName === 'command') {
        this.jsObjType = 'command';
        this.jsIsCommand = true;
        if (this.pattern !== null) {
          this.regex = new RegExp(this.pattern);
          delete this.pattern;
        }
      }
      else {
        this.jsObjType = this.inherit.includes("editor_room") ? 'room' : 'item';
      }

      this.inherit = this._removeFromArray(this.inherit, "editor_room");
      this.inherit = this._removeFromArray(this.inherit, "editor_object");

      // I think we can safely remove these as the defaults handle it
      this.inherit = this._removeFromArray(this.inherit, "talkingchar");
      this.jsPronoun = "thirdperson";

      if (this.jsObjType !== 'room') {
        if (this.take) {
          this.jsMobilityType = "Takeable";
        }

        else if (this.inherit.includes("editor_player")) {
          this.jsMobilityType = "Player";
          this.inherit = this._removeFromArray(this.inherit, "editor_player");
          this.jsPronoun = "secondperson";
        }

        else if (this.inherit.includes("namedfemale")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = true;
          this.properName = true;
          this.inherit = this._removeFromArray(this.inherit, "namedfemale");
          this.jsPronoun = "female";
        }

        else if (this.inherit.includes("namedmale")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = false;
          this.properName = true;
          this.inherit = this._removeFromArray(this.inherit, "namedmale");
          this.jsPronoun = "male";
        }

        else if (this.inherit.includes("female")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = true;
          this.properName = false;
          this.inherit = this._removeFromArray(this.inherit, "female");
          this.jsPronoun = "female";
        }

        else if (this.inherit.includes("male")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = false;
          this.properName = false;
          this.inherit = this._removeFromArray(this.inherit, "male");
          this.jsPronoun = "male";
        }

        else if (this.inherit.includes("topic")) {
          this.jsMobilityType = "Topic";
          this.jsFromStart = false;
          this.inherit = this._removeFromArray(this.inherit, "topic");
        }

        else if (this.inherit.includes("startingtopic")) {
          this.jsMobilityType = "Topic";
          this.jsFromStart = true;
          this.inherit = this._removeFromArray(this.inherit, "startingtopic");
        }

        else {
          this.jsMobilityType = "Immobile";
        }


        if (this.inherit.includes("surface")) {
          this.jsContainerType = "Surface";
          this.inherit = this._removeFromArray(this.inherit, "surface");
        }

        else if (this.inherit.includes("container_open")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = false;
          this.inherit = this._removeFromArray(this.inherit, "container_open");
        }

        else if (this.inherit.includes("container_closed")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = true;
          this.inherit = this._removeFromArray(this.inherit, "container_closed");
        }

        else if (this.inherit.includes("container_limited")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = false;
          this.inherit = this._removeFromArray(this.inherit, "container_limited");
          this.jsConversionNotes.push("Currently editor may not translate limited container properly");
        }

        else if (this.inherit.includes("openable")) {
          this.jsContainerType = "Openable";
          this.inherit = this._removeFromArray(this.inherit, "openable");
        }
        else {
          this.jsContainerType = "No";
        }

        if (this.inherit.includes("wearable")) {
          this.jsIsWearable = true;
          this.inherit = this._removeFromArray(this.inherit, "wearable");
          this.jsMobilityType = "Takeable";
        }
        else {
          this.jsIsWearable = false;
        }

        if (this.inherit.includes("switchable")) {
          this.jsIsSwitchable = true;
          this.inherit = this._removeFromArray(this.inherit, "switchable");
        }
        else {
          this.jsIsSwitchable = false;
        }

        if (this.inherit.includes("edible")) {
          this.jsIsEdible = true;
          this.inherit = this._removeFromArray(this.inherit, "edible");
          this.jsMobilityType = "Takeable";
        }
        else {
          this.jsIsEdible = false;
        }

        if (this.inherit.includes("plural")) {
          this.jsIsPronoun = "plural";
          this.inherit = this._removeFromArray(this.inherit, "plural");
        }
      }
      if (this.look) {
        if (this.examine) {
          this.jsConversionNotes.push("Cannot convert 'look' to 'examine' as object already has an 'examine' attribute");
        }
        else {
          this.examine = this.look;
          delete this.look;
        }
      }
      if (this.description) {
        if (this.desc) {
          this.jsConversionNotes.push("Cannot convert 'description' to 'desc' as object already has an 'desc' attribute");
        }
        else {
          this.desc = this.description;
          delete this.description;
        }
      }
      if (this.displayverbs || this.inventoryverbs) {
        this.jsConversionNotes.push("This object has custom inventory/display verbs set. These are handled very differently in Quest 6, so cannot be converted. You should modify the 'getVerbs' function yourself.");
        delete this.inventoryverbs;
        delete this.displayverbs;
      }
      if (this.inherit.length > 0) {
        this.jsConversionNotes.push("Failed to do anything with these inherited types: " + this.inherit)
      }
      else {
        delete this.inherit
      }
    }

    if (this.jsConversionNotes.length === 0) delete this.jsConversionNotes;
    return this;
  }

  _getDirectChildAttributes(element, tag, attr) {
    const types = Array.from(element.getElementsByTagName(tag));
    const types2 = types.filter(el => el.parentNode === element);
    return types2.map(el => el.getAttribute(attr));
  }

  _removeFromArray(arr, el) {
    if (arr !== undefined) {
      const index = arr.indexOf(el);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
    return arr;
  }



  // Import setting from version < 600
  importSettings(xmlDoc) {
    const gameObject = xmlDoc.getElementsByTagName("game")[0];

    const defaults = {
      jsObjType:'settings',
      jsShowRoomsOnly:true,
      jsNewRoomWhere:'Location',
      jsAutosaveInterval:1,
      title:gameObject.getAttribute('name'),
    }
    for (let key in defaults) this[key] = defaults[key]

    this._importSetting(gameObject, "subtitle", "subtitle");
    this._importSetting(gameObject, "author", "author");
    this._importSetting(gameObject, "version", "version");
    this._importSetting(gameObject, "echocommand", "cmdEcho", "boolean");
    this._importSetting(gameObject, "showcommandbar", "textInput", "boolean");

    this._importSetting(gameObject, "defaultfont", "jsStyleMain_font_family");
    this._importSetting(gameObject, "defaultfontsize", "jsStyleMain_font_size", "int");
    this._importSetting(gameObject, "defaultforeground", "jsStyleMain_color");
    this._importSetting(gameObject, "defaultbackground", "jsStyleMain_background_color");
    this._importSetting(gameObject, "backgroundimage", "jsStyleMain_background_image");

    this._importSetting(gameObject, "moneyformat", "moneyFormat");
    this._importSetting(gameObject, 'feature_asktell', 'jsnoAskTell', 'invert-boolean');
    this._importSetting(gameObject, 'feature_devmode', 'debug', 'boolean');

    this._importSetting(gameObject, "clearscreenonroomenter", "clearScreenOnRoomEnter", "boolean");
    this._importSetting(gameObject, "autodescription_youarein", "jsRoomTitlePos", "int");
    this._importSetting(gameObject, "autodescription_youcansee", "jsRoomItemsPos", "int");
    this._importSetting(gameObject, "autodescription_youcango", "jsRoomExitsPos", "int");
    this._importSetting(gameObject, "autodescription_description", "jsRoomDescPos", "int");
    this._importSetting(gameObject, "autodescription_youarein_newline", "jsRoomTitleNewLine", "boolean");
    this._importSetting(gameObject, "autodescription_youcansee_newline", "jsRoomItemsNewLine", "boolean");
    this._importSetting(gameObject, "autodescription_youcango_newline", "jsRoomExitsNewLine", "boolean");
    this._importSetting(gameObject, "autodescription_description_newline", "jsRoomDescNewLine", "boolean");
    this._importSetting(gameObject, "autodescription_youarein_useprefix", "jsRoomTitleYouAreIn", "boolean");

    if (gameObject.getElementsByTagName("defaultwebfont").length > 0) {
      this.jsStyleMain_font_family = gameObject.getElementsByTagName("defaultwebfont")[0].innerHTML;
      this.jsGoogleFonts = [this.jsStyleMain_font_family]
    }

    const statusattributes = gameObject.getElementsByTagName('statusattributes');
    if (statusattributes.length > 0) {
      this.jsStatusList = this.jsStatusList || [];
      const items = statusattributes[0].getElementsByTagName('item');
      for (let item of items) {
        var key = item.getElementsByTagName('key')[0].innerHTML;
//        var value = item.getElementsByTagName('value')[0].innerHTML;
        this.jsStatusList.push(key);
      }
    }

    const showmoney = gameObject.getElementsByTagName('showmoney')
    if (showmoney.length > 0) {
      const value = showmoney.innerHTML;
      if (value === 'true' || value === '' || value === undefined) {
        this.jsStatusList = this.jsStatusList || [];
        this.jsStatusList.push('money');
      }
    }
  }

  // Used in importSettings only
  _importSetting(gameObject, tagName, attName, type) {
    const els = gameObject.getElementsByTagName(tagName)
    if (els.length === 0) return;
    if (type === "int") {
      this[attName] = parseInt(els[0].innerHTML);
    }
    else if (type === "boolean") {
      this[attName] = els[0].innerHTML === "true" || els[0].innerHTML === "";
    }
    else if (type === 'invert-boolean') {
      this[attName] = els[0].innerHTML === 'false';
    }
    else {
      this[attName] = els[0].innerHTML;
    }
  }








  //---------------------------------------------------------------------
  //------------------  EXPORT FUNCTIONS  -------------------------

  // Unit tested
  toXml() {
    let str = "  <object name=\"" + this.name + "\">\n";
    for (let property in this) {
      if (property !== "name" && this.hasOwnProperty(property)) {
        const value = this[property];
        if (value === undefined) {
          console.log("No value found for property " + property + " of " + this.name)
        }
        else if (typeof value === "string") {
          str += "    <" + property + " type=\"string\"><![CDATA[" + value + "]]></" + property + ">\n";
        }
        else if (typeof value === "boolean") {
          str += "    <" + property + " type=\"boolean\">" + value + "</" + property + ">\n";
        }
        else if (typeof value === "number") {
          str += "    <" + property + " type=\"int\">" + value + "</" + property + ">\n";
        }
        else if (value instanceof Exit) {
          str += value.toXml(property)
        }
        else if (value instanceof RegExp) {
          str += "    <" + property + " type=\"regex\">" + value.source + "</" + property + ">\n";
        }
        else if (value instanceof Array) {
          str += "    <" + property + " type=\"stringlist\">\n";
          for (let i = 0; i < value.length; i++) {
            str += "      <value>" + value[i] + "</value>\n";
          }
          str += "    </" + property + ">\n";
        }
        else if (value.type) {
          if (value.type === 'js') {
            str += "    <" + property + " type=\"js\">\n"
            str += "      <params type=\"string\">" + (value.params ? value.params : '') + "</params>\n"
            str += "      <code><![CDATA[" + value.code + "]]></code>\n"
            str += "    </" + property + ">\n";
          }
          else if (value.type === 'script') {
            str += "    <" + property + " type=\"script\">\n"
            str += "      <code><![CDATA[" + value.code + "]]></code>\n"
            str += "    </" + property + ">\n";
          }
        }
        else  {
          console.log("Not saving type: " + property + "/" + value);
        }
      }
    }

    //console.log(this);
    return str + "  </object>\n\n";
  }

  // Converts one item to JavaScript code
  // Unit tested
  toJs() {
    if (this.jsObjType !== 'room' && this.jsObjType !== 'item') return '';

    let str = "\n\n\n";

    str += "create" + (this.jsObjType === 'room' ? "Room" : "Item") + "(\"" + this.name + "\", ";

    const jsTemplates = [];
    if (this.jsMobilityType === "Takeable") jsTemplates.push("TAKEABLE()");
    if (this.jsMobilityType === "Player") jsTemplates.push("PLAYER()");
    if (this.jsMobilityType === "NPC") jsTemplates.push("NPC()");
    if (this.jsContainerType === "Container") jsTemplates.push("CONTAINER()");
    if (this.jsContainerType === "Surface") jsTemplates.push("SURFACE()");
    if (this.jsContainerType === "Openable") jsTemplates.push("OPENABLE()");
    if (this.jsIsLockable) jsTemplates.push("LOCKED_WITH()");
    if (this.jsIsWearable) jsTemplates.push("WEARABLE()");
    if (this.jsIsEdible) jsTemplates.push("EDIBLE()");
    if (this.jsIsCountable) jsTemplates.push("COUNTABLE()");
    if (this.jsIsFurniture) jsTemplates.push("FURNITURE()");
    if (this.jsIsSwitchable) jsTemplates.push("SWITCHABLE()");
    if (this.jsIsComponent) jsTemplates.push("COMPONENT()");
    if (jsTemplates.length > 0) str += jsTemplates.join(', ') + ", ";

    str += this.beautifyObject(0);
    str += ")";
    return str;
  }


  // Converts one item to JavaScript code
  toJsSettings() {
    if (this.jsObjType !== 'settings') return '';

    //console.log(this)

    let str = "\n\n\n";

    const libs = new TabControls().libraries;
    for (let lib of libs) {
    console.log(lib)
      str += "settings.customLibraries.push({folder:'" + lib.name + "', files:["
    console.log(lib.files)
      str += lib.files.map(el => ('"' + el + '"')).join(', ')
    console.log(str)
      str += "]})\n"
    }

    str += "settings.inventories = [\n"
    if (this.jsInvHeld) str += "  {name:'Items Held', alt:'itemsHeld', test:settings.isHeldNotWorn, getLoc:function() { return game.player.name; } },\n"
    if (this.jsInvWorn) str += "  {name:'Items Worn', alt:'itemsWorn', test:settings.isWorn, getLoc:function() { return game.player.name; } },\n"
    if (this.jsInvHere) str += "  {name:'Items Here', alt:'itemsHere', test:settings.isHere, getLoc:function() { return game.player.loc; } },\n"
    str += "]\n"

    const _ = require('lodash');

    if (this.jsStatusList) {
      str += "settings.status = [\n"
      for (let s of this.jsStatusList) {
        str += '  function() { return "<td>' + s + ':</td><td>" + game.player.' + _.camelCase(s) + ' + "</td>"; },\n'
      }
      str += "]\n"
    }


    str += "settings.template = [\n"
    let line = ''
    for (let i = 1; i < 5; i++) {
      let newline
      if (this.jsRoomTitlePos === i) {
        if (this.jsRoomTitleYouAreIn) {
          line += "You are in {hereName}."
        }
        else if (this.jsRoomTitleNewLine) {
          line += "#{cap:{hereName}}"
        }
        else  {
          line += "{b:{cap:{hereName}}}"
        }
        newline = this.jsRoomTitleNewLine
      }
      if (this.jsRoomItemsPos === i) {
        line += "{objectsHere:You can see {objects} here.}"
        newline = this.jsRoomItemsNewLine
      }
      if (this.jsRoomExitsPos === i) {
        line += "{exitsHere:You can go {exits}.}"
        newline = this.jsRoomExitsNewLine
      }
      if (this.jsRoomDescPos === i) {
        line += "{terse:{hereDesc}}"
        newline = this.jsRoomDescNewLine
      }

      if (newline) {
        str += "  '" + line + "',\n"
        line = ''
      }
      else {
        line += ' '
      }
    }
    str += "  '" + line + "',\n"
    str += "]\n"

    for (let key in this) {
      if (typeof key === 'undefined' || key === 'undefined') {
        continue
      }

      if (/^js[A-Z]/.test(key) || key === 'name') continue;

      // Some settings are either false or a string, and in the editor set in two places
      if (/^js[a-z]/.test(key)) {
        if (this[key] === false) str += 'settings.' + key.replace(/^js/, "") + " = false\n"
        continue
      }
      if (this['js' + key] === false) {
        continue
      }

      str += 'settings.' + key.replace("__", ".") + " = "
      switch (typeof this[key]) {
        case "boolean": str += (this[key] ? "true" : "false"); break;
        case "string":  str += "\"" + this[key] + "\""; break;
        case "number": str += this[key]; break;
        default: str += '[' + this[key].map(el => '"' + el + '"').join(', ') + ']'
      }
      str += "\n";
    }
    return str;
  }

  // Converts one item to CSS settings
  toCss() {
    if (this.jsObjType !== 'settings') return '';

    let str = "";

    if (this.jsGoogleFonts && this.jsGoogleFonts.length > 1) {
      str += "@import url('https://fonts.googleapis.com/css?family=" + this.jsGoogleFonts.map(el => el.replace(/ /g, '+')).join('|') + "');\n\n"
    }
    str += "#main {\n"
    if (this.jsStyleMain_color) str += "  color:" + this.jsStyleMain_color + ";\n"
    if (this.jsStyleMain_background_color) str += "  background-color:" + this.jsStyleMain_background_color + ";\n"
    if (this.jsStyleMain_font_family) str += "  font-family:" + this.jsStyleMain_font_family + ";\n"
    if (this.jsStyleMain_font_size) str += "  font-size:" + this.jsStyleMain_font_size + "pt;\n"
    str += "}\n\n\n"
    str += "sidepanes {\n"
    if (this.jsStyleSide_color) str += "  color:" + this.jsStyleSide_color + ";\n"
    if (this.jsStyleSide_background_color) str += "  background-color:" + this.jsStyleSide_background_color + ";\n"
    if (this.jsStyleSide_font_family) str += "  font-family:" + this.jsStyleSide_font_family + ";\n"
    if (this.jsStyleSide_font_size) str += "  font-size:" + this.jsStyleSide_font_size + "pt;\n"
    str += "}\n\n\n"

    return str;
  }

  // Converts one item to code.js settings
  // This will be functions and commands
  toCode() {
    if (this.jsObjType !== 'command') return '';

    //TODO!!!
    return '';
  }

  beautifyObject(indent) {
    return beautifyObjectHelper(this, indent);
  }

  beautifyFunction(str, indent) {
    if (indent === undefined) indent = 0;
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
}








class Exit {
  constructor (name, data) {
    this.name = name;
    this.data = data === undefined ? {} : data;

    if (!this.data.useType) this.data.useType = "default";
    //if (typeof this.data.msg === "string") this.data.useType = "msg";
    //if (typeof this.data.use === "string") this.data.useType = "named";
    //if (typeof this.data.use === "function") this.data.useType = "custom";

    // these are held elsewhere, deleted for testing import and export
    delete this.data.alias
    delete this.data.to
  }

  static createFromXml(node) {
    return new Exit(node.getAttribute('to'), xmlToDict(node))
  }

  toXml(property) {
    let str = "    <exit alias=\"" + property + "\" to=\"" + this.name + "\">\n"
    if (this.data.useType !== "default") {
      str += "      <useType>" + this.data.useType + "</useType>\n"
      if (this.data.useType === "msg") str += "      <msg><![CDATA[" + this.data.msg + "]]></msg>\n"
      if (this.data.useType === "use") str += "      <use>" + this.data.use + "</use>\n"
      if (this.data.useType === "custom") str += "      <use><![CDATA[" + this.data.use + "]]></use>\n"
    }
    str += "    </exit>\n"
    return str
  }

  beautify(dir, indent) {
    //console.log(this.data)
    let s = tabs(indent) + dir + ":new Exit(\"" + this.name + "\""
    if (this.data.useType === "default") return s + "),"
    if (this.data.useType === "msg") return s + ", {\n" + tabs(indent+1) + "msg:\"" + this.data.msg + "\",\n" + tabs(indent) + "}),"
    if (this.data.useType === "custom") {
      s += ", {\n" + tabs(indent+1) + "use:function() {\n" + indentLines(this.data.use, indent + 2)
      s += tabs(indent + 1) + "},\n" + tabs(indent) + "}),"
      return s
    }
  }

}



// Used by beautifyX to help formatting JavaScript
const tabs = function(n) {
  let res = "";
  for (let i = 0; i < n; i++) res += "  ";
  return res;
}


const beautifyObjectHelper = function(item, indent) {
  let str = tabs(indent) + "{\n";
  indent++;
  for (let key in item) {
    if (/^js[A-Z]/.test(key) || key === 'name') continue;
    switch (typeof item[key]) {
      case "boolean": str += tabs(indent) + key + ":" + (item[key] ? "true" : "false") + ","; break;
      case "string":
        if (/^function\(/.test(item[key])) {
          str += tabs(indent) + key + ":" + item[key] + ","
        }
        else {
          str += tabs(indent) + key + ":\"" + item[key] + "\",";
        }
        break;
      //case "function": str += tabs(indent) + key + ":" + this.beautifyFunction(item[key].toString(), indent); break;
      case "number": str += tabs(indent) + key + ":" + item[key] + ","; break;
      case "object":
        if (item[key] instanceof Exit) {
          str += item[key].beautify(key, indent); break;
        }
        else if (item[key] instanceof RegExp) {
          str += tabs(indent) + key + ":/" + item[key].source + "/,"; break;
        }
        else if (item[key] instanceof Array) {
          str += tabs(indent) + key + ':[' + item[key].map(el => '"' + el + '"').join(', ') + '],'; break;
        }
        else if (item[key].type === 'script') {
          str += tabs(indent) + key + ":undefined, // WARNING: This script has not been included as it is in ASLX, not JavaScript"; break;
        }
        else if (item[key].type === 'js') {
          str += tabs(indent) + key + ":function(" + (item[key].params ? item[key].params : '') + ") {\n" + indentLines(item[key].code, indent + 1) + tabs(indent) + "},"; break;
        }
    }
    str += "\n";
  }
  indent--;
  str += tabs(indent) + "}";
  return str;
}


const indentLines = function(s, indent) {
  //console.log(s)
  return tabs(indent) + s.trim().replace(/\r?\n/g, '\n' + tabs(indent)) + "\n"
}


const xmlToDict = function(xml, settings) {
  const res = settings ? settings : {}
  if (xml.attributes) {
    for (let att of xml.attributes) {
      res[att.name] = att.value
    }
  }
  if (xml.children) {
    for (let att of xml.children) {
      res[att.tagName] = convertValue(att.innerHTML, att.getAttribute('type'))
    }
  }
  return res
}


const convertValue = function(s, type) {
  if (type === 'string' && s === '') return ''
  if (s === '') return true
  if (type === 'int') return parseInt(s)
  if (type === 'boolean') return (s === 'true')
  return removeCDATA(s)
}


const removeCDATA = function(s) {
  if (s.startsWith('<![CDATA[')) {
    return s.substring(9, s.length - 3);
  }
  else {
    return s;
  }
}

const removeBR = function(s) {
  return s.replace(/\<br\/\>/i, "|");
}


module.exports = [QuestObject, Exit, xmlToDict]
