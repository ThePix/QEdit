'use strict'

let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = "useWithDoor";
const DSPY_SCENERY = 5;



export class QuestObject {
  constructor (data, version) {
    if (data instanceof Element) {
      this.translateObjectFromXml(data, version);
    }
    else {
      for (let key in data) {
        this[key] = data[key]
      }
    }
  }
 
  
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
      console.log("Not got a suitable tab, so find the first that is");
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
    if (this.jsIsSettings) {
      return "treeSettings";
    }
    else if (this.jsIsRoom) {
      return this.jsIsZone ? "treeZone" : "treeRoom";
    }
    else {
      return this.jsIsStub ? "treeStub" : "treeItem";
    }
  }



  //------------------  INPUT FUNCTIONS  -------------------------

  // Used by readFile to create one object from its XML
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
    for (let j = 0; j < xml.childNodes.length; j++) {
      if (xml.childNodes[j].nodeType === 1 && xml.childNodes[j].tagName !== 'object') {
        const attType = xml.childNodes[j].getAttribute('type');
        const value = xml.childNodes[j].innerHTML;
        const name = (xml.childNodes[j].tagName === "attr" ? xml.childNodes[j].getAttribute('name') : xml.childNodes[j].tagName);
        
        if (name === "inherit") {
          this.inherit = xml.childNodes[j].getAttribute('name');
        }
        else if (attType === 'boolean') {
          this[name] = value === 'true' || value === '';
          //console.log("Boolean");
        }
        else if (attType === 'int') {
          this[name] = parseInt(value);
          //console.log("Int");
        }
        else if (attType === 'stringlist') {
          const els = xml.childNodes[j].getElementsByTagName('value');
          const arr = [];
          for (let k = 0; k < els.length; k++) arr.push(els[k].innerHTML);
          this[name] = arr;
          //console.log("stringlist for " + object.name);
        }
        else if (attType === 'script') {
          this[name] = { type: 'script', code:this.removeCDATA(value) };
          //console.log("Script");
        }
        else if (attType === 'js') {
          this[name] = { type: 'js', code:this.removeCDATA(value) };
          //console.log("JavaScript");
        }
        else if (attType === 'blockly') {
          this[name] = { type: 'blockly', code:value };
          //console.log("XML code");
        }
        else if (name === 'exit') {
          this[xml.childNodes[j].getAttribute('alias')] = new Exit(xml.childNodes[j].getAttribute('to'), {});
          //console.log("Exit");
        }
        else if (attType === 'string' || attType === '' || attType === null || attType === 'object') {
          this[name] = this.removeBR(this.removeCDATA(value));
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
      let inherits = this.getDirectChildAttributes(xml, "inherit", 'name');
      //console.log(inherits);
      
      this.jsIsRoom = inherits.includes("editor_room");
      inherits = this.removeFromArray(inherits, "editor_room");
      inherits = this.removeFromArray(inherits, "editor_object");
      
      // I think we can safely remove these as the defaults handle it
      inherits = this.removeFromArray(inherits, "talkingchar");
      this.jsPronoun = "thirdperson";

      if (this.jsIsRoom) {
        this.jsExpanded = true;
      }
      else {
        if (this.take) {
          this.jsMobilityType = "Takeable";
        }
        
        else if (inherits.includes("editor_player")) {
          this.jsMobilityType = "Player";
          inherits = this.removeFromArray(inherits, "editor_player");
          this.jsPronoun = "secondperson";
        }
        
        else if (inherits.includes("namedfemale")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = true;
          this.properName = true;
          inherits = this.removeFromArray(inherits, "namedfemale");
          this.jsPronoun = "female";
        }
          
        else if (inherits.includes("namedmale")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = false;
          this.properName = true;
          inherits = this.removeFromArray(inherits, "namedmale");
          this.jsPronoun = "male";
        }
          
        else if (inherits.includes("female")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = true;
          this.properName = false;
          inherits = this.removeFromArray(inherits, "female");
          this.jsPronoun = "female";
        }
          
        else if (inherits.includes("male")) {
          this.jsMobilityType = "NPC";
          this.jsFemale = false;
          this.properName = false;
          inherits = this.removeFromArray(inherits, "male");
          this.jsPronoun = "male";
        }
        
        else if (inherits.includes("topic")) {
          this.jsMobilityType = "Topic";
          this.jsFromStart = false;
          inherits = this.removeFromArray(inherits, "topic");
        }
        
        else if (inherits.includes("startingtopic")) {
          this.jsMobilityType = "Topic";
          this.jsFromStart = true;
          inherits = this.removeFromArray(inherits, "startingtopic");
        }
        
        else {
          this.jsMobilityType = "Immobile";
        }


        if (inherits.includes("surface")) {
          this.jsContainerType = "Surface";
          inherits = this.removeFromArray(inherits, "surface");
        }

        else if (inherits.includes("container_open")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = false;
          inherits = this.removeFromArray(inherits, "container_open");
        }

        else if (inherits.includes("container_closed")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = true;
          inherits = this.removeFromArray(inherits, "container_closed");
        }

        else if (inherits.includes("container_limited")) {
          this.jsContainerType = "Container";
          this.jsContainerClosed = false;
          inherits = this.removeFromArray(inherits, "container_limited");
          this.jsConversionNotes.push("Currently editor may not translate limited container properly");
        }

        else if (inherits.includes("openable")) {
          this.jsContainerType = "Openable";
          inherits = this.removeFromArray(inherits, "openable");
        }
        else {
          this.jsContainerType = "No";
        }
        
        if (inherits.includes("wearable")) {
          this.jsIsWearable = true;
          inherits = this.removeFromArray(inherits, "wearable");
          this.jsMobilityType = "Takeable";
        }
        else {
          this.jsIsWearable = false;
        }
        
        if (inherits.includes("switchable")) {
          this.jsIsSwitchable = true;
          inherits = this.removeFromArray(inherits, "switchable");
        }
        else {
          this.jsIsSwitchable = false;
        }
        
        if (inherits.includes("edible")) {
          this.jsIsEdible = true;
          inherits = this.removeFromArray(inherits, "edible");
          this.jsMobilityType = "Takeable";
        }
        else {
          this.jsIsEdible = false;
        }

        if (inherits.includes("plural")) {
          this.jsIsPronoun = "plural";
          inherits = this.removeFromArray(inherits, "plural");
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
      if (inherits.length > 0) this.jsConversionNotes.push("Failed to do anything with these inherited types: " + inherits);
    }

    if (this.jsConversionNotes.length === 0) delete this.jsConversionNotes;

    //console.log(this);
    return this;    
  }

  removeCDATA(s) {
    if (s.startsWith('<![CDATA[')) {
      return s.substring(9, s.length - 3);
    }
    else {
      return s;
    }
  }
  
  removeBR(s) {
    return s.replace(/\<br\/\>/i, "\n");
  }
  
  getDirectChildAttributes(element, tag, attr) {
    const types = Array.from(element.getElementsByTagName(tag));
    const types2 = types.filter(el => el.parentNode === element);
    return types2.map(el => el.getAttribute(attr));
  }

  removeFromArray(arr, el) {
    const index = arr.indexOf(el);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }  
  
  
  importSettings(xmlDoc) {
    const gameObject = xmlDoc.getElementsByTagName("game")[0];
    this.TITLE = gameObject.getAttribute('name');

    this.importSetting(gameObject, "subtitle", "SUBTITLE");
    this.importSetting(gameObject, "author", "AUTHOR");
    this.importSetting(gameObject, "version", "VERSION");
    this.importSetting(gameObject, "echocommand", "CMD_ECHO", "boolean");
    this.importSetting(gameObject, "showcommandbar", "TEXT_INPUT", "boolean");


    this.importSetting(gameObject, "defaultfont", "jsStyleMain_font_family");
    this.importSetting(gameObject, "defaultfontsize", "jsStyleMain_font_size", "int");
    this.importSetting(gameObject, "defaultforeground", "jsStyleMain_color");
    this.importSetting(gameObject, "defaultbackground", "jsStyleMain_background_color");
    this.importSetting(gameObject, "backgroundimage", "jsStyleMain_background_image");

    this.importSetting(gameObject, "moneyformat", "MONEY_FORMAT");


    // If there is a web font, we will use that, but flag that we need extrea code in style.css
    if (gameObject.getElementsByTagName("defaultwebfont").length > 0) {
      this.jsStyleMain_font_family = gameObject.getElementsByTagName("defaultwebfont")[0].innerHTML;
      this.jsStyleUseWebFont = true;
    }
    console.log(this);
  }
  
  importSetting(gameObject, tagName, attName, type) {
    const els = gameObject.getElementsByTagName(tagName)
    if (els.length === 0) return;
    if (type === "int") {
      this[attName] = parseInt(els[0].innerHTML);
    }
    else if (type === "boolean") {
      this[attName] = els[0].innerHTML === "true" || els[0].innerHTML === "";
    }
    else {
      this[attName] = els[0].innerHTML;
    }
  }
  
  
  
  
  
  
  
  
  //------------------  OUTPUT FUNCTIONS  -------------------------
  
   toXml() {
    let str = "  <object name=\"" + this.name + "\">\n";
    for (let property in this) {
      if (property !== "name" && this.hasOwnProperty(property)) {
        const value = this[property];
        if (typeof value === "string") {
          str += "    <" + property + "><![CDATA[" + value + "]]></" + property + ">\n";
        }
        else if (typeof value === "boolean") {
          str += "    <" + property + " type=\"boolean\">" + value + "</" + property + ">\n";
        }
        else if (typeof value === "number") {
          str += "    <" + property + " type=\"int\">" + value + "</" + property + ">\n";
        }
        else if (value instanceof Exit) {
          str += "    <exit alias=\"" + property + "\" to=\"" + value + "\">\n";
          // TODO !!!
          str += "    </exit>\n";
        }
        else if (value instanceof Array) {
          str += "    <" + property + " type=\"stringlist\">\n";
          for (let i = 0; i < value.length; i++) {
            str += "      <value>" + value[i] + "</value>\n";
          }
          str += "    </" + property + ">\n";
        }
        else if (value.type) {
          str += "    <" + property + " type=\"" + value.type + "\"><![CDATA[" + value.code + "]]></" + property + ">\n";
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
  toJs() {
    if (this.jsIsStub || this.jsIsSettings) return '';
    
    let str = "\n\n\n";

    str += "create" + (this.jsIsRoom ? "Room" : "Item") + "(\"" + this.name + "\",\n";

    const jsTemplates = [];
    if (this.jsMobilityType === "Takeable") jsTemplates.push("TAKEABLE");
    if (this.jsMobilityType === "Player") jsTemplates.push("PLAYER");
    if (this.jsMobilityType === "NPC") jsTemplates.push("NPC");
    if (this.jsContainerType === "Container") jsTemplates.push("CONTAINER");
    if (this.jsContainerType === "Surface") jsTemplates.push("SURFACE");
    if (this.jsContainerType === "Openable") jsTemplates.push("OPENABLE");
    if (this.jsIsLockable) jsTemplates.push("LOCKED_WITH");
    if (this.jsIsWearable) jsTemplates.push("WEARABLE");
    if (this.jsIsEdible) jsTemplates.push("EDIBLE");
    if (this.jsIsCountable) jsTemplates.push("COUNTABLE");
    if (this.jsIsFurniture) jsTemplates.push("FURNITURE");
    if (this.jsIsSwitchable) jsTemplates.push("SWITCHABLE");
    if (this.jsIsComponent) jsTemplates.push("COMPONENT");
    for (let i = 0; i < jsTemplates.length; i++) {
      str += "  " + jsTemplates[i] + "\n";
    }
    
    str += this.beautifyObject(item, 1);
    str += ");";
    return str;
  }
  
  // Converts one item to JavaScript code
  toJsSettings() {
    if (!this.jsIsSettings) return '';
    
    let str = "\n\n\n";
    
    // These are (currently) not editable
    str += 'const LANG_FILENAME = "lang-en.js";\n'
    str += 'const DEBUG = true;\n'
    str += 'const PARSER_DEBUG = false;\n'
    str += 'const FILES = ["code", "data", "npcs"];\n'
    str += 'const SPLIT_LINES_ON = "<br>";\n'
    str += 'const DATE_TIME_OPTIONS = {};\n'

    for (let key in this) {
      if (/^js[A-Z]/.test(key)) continue;
      const inDict = key.includes("__");
      if (inDict) {
        str += key.replace("__", ".") + " = ";
      }
      else {    
        str += "const " + key + " = ";
      }
      switch (typeof this[key]) {
        case "boolean": str += (this[key] ? "true" : "false"); break;
        case "string":  str += "\"" + this[key] + "\""; break;
        case "number": str += this[key]; break;
      }
      str += "\n";
    }
    return str;
  }
  
  beautifyObject(indent) {
    return this.beautifyObjectHelper(this, indent);
  }  

  beautifyExit(dir, exit, indent) {
    let res = this.tabs(indent) + dir + ":new Exit(\"" + exit.name + "\"";
    if (exit.data) {
      return this.beautifyObjectHelper(exit, indent) + "\")";
    }
    else {
      return res + ")";
    }
  }

  beautifyFunction(str, indent) {
    if (indent === undefined) indent = 0;
    let res = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "{") {
        indent++;
        res += "{\n" + this.tabs(indent);
      }
      else if (str[i] === "}") {
        res = res.trim();
        indent--;
        res += "\n" + this.tabs(indent) + "}\n" + this.tabs(indent);
      }
      else if (str[i] === ";") {
        res += ";\n" + this.tabs(indent);
      }
      else {
        res += str[i];
      }
    }
    return res.trim();
  }

  // Used by beautifyX to help formatting JavaScript
  tabs(n) {
    let res = "";
    for (let i = 0; i < n; i++) res += "  ";
    return res;
  }

  beautifyObjectHelper(item, indent) {
    let str = this.tabs(indent) + "{\n";
    indent++;
    for (let key in item) {
      if (/^js[A-Z]/.test(key)) continue;
      switch (typeof item[key]) {
        case "boolean": str += this.tabs(indent) + key + ":" + (item[key] ? "true" : "false"); break;
        case "string": 
          if (/^function\(/.text(item[key])) {
            str += this.tabs(indent) + key + ":" + item[key];
          }
          else {
            str += this.tabs(indent) + key + ":\"" + item[key] + "\"";
          }
          break;
        //case "function": str += this.tabs(indent) + key + ":" + this.beautifyFunction(item[key].toString(), indent); break;
        case "number": str += this.tabs(indent) + key + ":" + item[key]; break;
        case "object": 
          if (item[key] instanceof Exit) {
            str += this.beautifyExit(key, item[key], indent); break;
          }
          else if (item[key] instanceof RegExp) {
            str += this.tabs(indent) + key + ":/" + item[key].source + "/"; break;
          }
      }
      str += ",\n";
    }
    indent--;
    str += this.tabs(indent) + "}\n";
    return str;
  }

}






export class Exit {
  constructor (name, data) {
    this.name = name;
    this.data = data === undefined ? {} : data;

    this.data.useType = "default";
    if (typeof this.data.msg === "string") this.data.useType = "msg";
    if (this.data.use === "useWithDoor") this.data.useType = "useWithDoor";
    if (typeof this.data.use === "function") this.data.useType = "custom";
  }
}

