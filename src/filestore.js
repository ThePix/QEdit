'use strict'

const fs = require('fs');


let settings = require("./lang-en.js");
const PRONOUNS = settings.PRONOUNS;
const EXITS = settings.EXITS;
const useWithDoor = "useWithDoor";
const DSPY_SCENERY = 5;



/*

I think synchronous will be good enough because we are saving/loading locally
and it is reasonable to expect the user to wait whilst it happens.

*/

export class FileStore {
  constructor (filename) {
    this.filename = filename
  }

  getDirectChildAttributes(element, tag, attr) {
    const types = Array.from(element.getElementsByTagName(tag));
    const types2 = types.filter(el => el.parentNode === element);
    return types2.map(el => el.getAttribute(attr));
  }


  // This should read both Quest 5 and Quest 6 XML files,
  // which hopefully are pretty much the same
  readFile() {
    const str = fs.readFileSync(this.filename + ".aslx", "utf8");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(str, "text/xml");
    
    const version = parseInt(xmlDoc.getElementsByTagName("asl")[0].getAttribute('version'));
    
    console.log("Opening XML file, version " + version);
    
    const objects = [];
    const arr = xmlDoc.getElementsByTagName("object");
    for (let i = 0; i < arr.length; i++) {
      objects.push(this.translateObjectFromXml(arr[i], version));
    }
    
    if (version < 600) {
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].jsOldName) {
          console.log(objects[i].jsOldName)
          for (let j = 0; j < objects.length; j++) {
            if (objects[j].loc === objects[i].jsOldName) objects[j].loc = objects[i].name;
            if (i !== j && objects[j].name === objects[i].name) objects[i].jsConversionNotes.push("Renaming has caused a naming collision!!!");
          }
        }
      }
    }
    
    return objects
  }


  // Used by readFile to create one object from its XML
  translateObjectFromXml(xml, version) {
    const object = {};
    object.jsConversionNotes = [];

    object.name = xml.getAttribute('name');
    if (/ /.test(object.name)) {
      object.jsConversionNotes.push("Object name had spaces removed; update any references (locations have been updates automatically); check no naming collision.");
      object.jsOldName = object.name;
      object.name = object.name.replace(/ /, "_");
    }

    
    // Parent -> loc
    if (xml.parentNode.nodeType === 1) {
      //console.log("Parent is: " + xml.parentNode.tagName);
      if (xml.parentNode.tagName === 'object') {
        object.loc = xml.parentNode.getAttribute('name');
        //console.log("Added parent: " + xml.parentNode.getAttribute('name'));
      }
    }

    // Attributes
    for (let j = 0; j < xml.childNodes.length; j++) {
      if (xml.childNodes[j].nodeType === 1 && xml.childNodes[j].tagName !== 'object') {
        const attType = xml.childNodes[j].getAttribute('type');
        if (xml.childNodes[j].tagName === "attr") {
          object[xml.childNodes[j].getAttribute('name')] = xml.childNodes[j].innerHTML;
          object.jsConversionNotes.push("Attribute may not have being converted properly: " + xml.childNodes[j].getAttribute('name'));
        }
        else if (xml.childNodes[j].tagName === "inherit") {
          object.inherit = xml.childNodes[j].getAttribute('name');
        }
        else if (attType === 'boolean') {
          object[xml.childNodes[j].tagName] = xml.childNodes[j].innerHTML === 'true' || xml.childNodes[j].innerHTML === '';
          //console.log("Boolean");
        }
        else if (attType === 'int') {
          object[xml.childNodes[j].tagName] = parseInt(xml.childNodes[j].innerHTML);
          //console.log("Int");
        }
        else if (attType === 'stringlist') {
          const els = xml.childNodes[j].getElementsByTagName('value');
          const arr = [];
          for (let k = 0; k < els.length; k++) arr.push(els[k].innerHTML);
          object[xml.childNodes[j].tagName] = arr;
          //console.log("stringlist");
        }
        else if (attType === 'script') {
          object[xml.childNodes[j].tagName] = { lang: 'script', code:this.removeCDATA(xml.childNodes[j].innerHTML) };
          //console.log("Script");
        }
        else if (attType === 'js') {
          object[xml.childNodes[j].tagName] = { lang: 'js', code:this.removeCDATA(xml.childNodes[j].innerHTML) };
          //console.log("JavaScript");
        }
        else if (attType === 'blockly') {
          object[xml.childNodes[j].tagName] = { lang: 'blockly', code:xml.childNodes[j].innerHTML };
          //console.log("XML code");
        }
        else if (xml.childNodes[j].tagName === 'exit') {
          object[xml.childNodes[j].getAttribute('alias')] = new Exit(xml.childNodes[j].getAttribute('to'), {});
          //console.log("Exit");
        }
        else if (attType === 'string' || attType === '' || attType === null || attType === 'object') {
          object[xml.childNodes[j].tagName] = this.removeBR(this.removeCDATA(xml.childNodes[j].innerHTML));
        }
        else {
          object[xml.childNodes[j].tagName] = xml.childNodes[j].innerHTML;
          object.jsConversionNotes.push("Attribute has not have being converted properly: " + xml.childNodes[j].tagName);
        }
      }
    }

    // If this is a conversion from Quest 5 we need to handle the "inherit"
    // elements, which correspond approximately to templates
    if (version < 600) {
      let inherits = this.getDirectChildAttributes(xml, "inherit", 'name');
      //console.log(inherits);
      
      object.jsIsRoom = inherits.includes("editor_room");
      inherits = this.removeFromArray(inherits, "editor_room");
      inherits = this.removeFromArray(inherits, "editor_object");
      
      // I think we can safely remove these as the defaults handle it
      inherits = this.removeFromArray(inherits, "talkingchar");

      if (!object.jsIsRoom) {
        if (object.take) {
          object.jsMobilityType = "Takeable";
        }
        
        else if (inherits.includes("editor_player")) {
          object.jsMobilityType = "Player";
          inherits = this.removeFromArray(inherits, "editor_player");
        }
        
        else if (inherits.includes("namedfemale")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = true;
          object.properName = true;
          inherits = this.removeFromArray(inherits, "namedfemale");
        }
          
        else if (inherits.includes("namedmale")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = false;
          object.properName = true;
          inherits = this.removeFromArray(inherits, "namedmale");
        }
          
        else if (inherits.includes("female")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = true;
          object.properName = false;
          inherits = this.removeFromArray(inherits, "female");
        }
          
        else if (inherits.includes("male")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = false;
          object.properName = false;
          inherits = this.removeFromArray(inherits, "male");
        }
        
        else if (inherits.includes("topic")) {
          object.jsMobilityType = "Topic";
          object.jsFromStart = false;
          inherits = this.removeFromArray(inherits, "topic");
        }
        
        else if (inherits.includes("startingtopic")) {
          object.jsMobilityType = "Topic";
          object.jsFromStart = true;
          inherits = this.removeFromArray(inherits, "startingtopic");
        }
        
        else {
          object.jsMobilityType = "Immobile";
        }


        if (inherits.includes("surface")) {
          object.jsContainerType = "Surface";
          inherits = this.removeFromArray(inherits, "surface");
        }

        else if (inherits.includes("container_open")) {
          object.jsContainerType = "Container";
          object.jsContainerClosed = false;
          inherits = this.removeFromArray(inherits, "container_open");
        }

        else if (inherits.includes("container_closed")) {
          object.jsContainerType = "Container";
          object.jsContainerClosed = true;
          inherits = this.removeFromArray(inherits, "container_closed");
        }

        else if (inherits.includes("container_limited")) {
          object.jsContainerType = "Container";
          object.jsContainerClosed = false;
          inherits = this.removeFromArray(inherits, "container_limited");
          object.jsConversionNotes.push("Currently editor may not translate limited container properly");
        }

        else if (inherits.includes("openable")) {
          object.jsContainerType = "Openable";
          inherits = this.removeFromArray(inherits, "openable");
        }
        else {
          object.jsContainerType = "No";
        }
        
        if (inherits.includes("wearable")) {
          object.jsIsWearable = true;
          inherits = this.removeFromArray(inherits, "wearable");
        }
        else {
          object.jsIsWearable = false;
        }
        
        if (inherits.includes("switchable")) {
          object.jsIsSwitchable = true;
          inherits = this.removeFromArray(inherits, "switchable");
        }
        else {
          object.jsIsSwitchable = false;
        }
        
        if (inherits.includes("edible")) {
          object.jsIsEdible = true;
          inherits = this.removeFromArray(inherits, "edible");
        }
        else {
          object.jsIsEdible = false;
        }
      }
      if (object.look) {
        if (object.examine) {
          object.jsConversionNotes.push("Cannot convert 'look' to 'examine' as object already has an 'examine' attribute");
        }
        else {
          object.examine = object.look;
          delete object.look;
        }
      }
      if (object.description) {
        if (object.desc) {
          object.jsConversionNotes.push("Cannot convert 'description' to 'desc' as object already has an 'desc' attribute");
        }
        else {
          object.desc = object.description;
          delete object.description;
        }
      }
      if (inherits.length > 0) object.jsConversionNotes.push("Failed to do anything with these inherited types: " + inherits);
    }

    if (object.jsConversionNotes.length > 0) {
      console.log(object.jsConversionNotes);
    }
    else {
      delete object.jsConversionNotes;
    }

    //console.log(object);
    return object;    
  }


  writeFile(objects) {
    let str = "<!--Saved by Quest 6.0.0-->\n<asl version=\"600\">\n"

    for (let i = 0; i < objects.length; i++) {
      str += this.translateObjectToXml(objects[i]);
    }
    fs.writeFileSync(this.filename + ".asl6", str, "utf8");
  }


  translateObjectToXml(object) {
    let str = "  <object name=\"" + object.name + "\">\n";
    for (let property in object) {
      if (property !== "name" && object.hasOwnProperty(property)) {
        const value = object[property];
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
        else if (value.lang) {
          str += "    <" + property + " type=\"" + value.lang + "\"><![CDATA[" + value.code + "]]></" + property + ">\n";
        }
        else  {
          console.log("Not saving type: " + property + "/" + value);
        }
      }
    }    

    //console.log(object);
    return str + "  </object>\n\n";
  }




  
  writeFileJS(objects) {
    let str = "\"use strict\";";
    for (let i = 0; i < objects.length; i++) str += FSHelpers.pack(objects[i]);
    fs.writeFileSync(this.filename + "2", str, "utf8");
  }
  
  
  
  
  removeFromArray(arr, el) {
    const index = arr.indexOf(el);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
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



const FSHelpers = {}

FSHelpers.ignoreKeys = [
  "name", "jsIsRoom", "jsComments", "jsMobilityType", "jsContainerType", "jsIsLockable",
  "jsIsWearable", "jsIsCountable", "jsIsFurniture", "jsIsSwitchable", "jsIsComponent",
  "jsIsEdible", "jsExpanded", "jsIsZone", "jsColour",
];

// Converts one item to JavaScript code
FSHelpers.pack = function(item) {
  let str = "\n\n\n";

  str += "create" + (item.jsIsRoom ? "Room" : "Item") + "(\"" + item.name + "\",\n";

  const jsTemplates = [];
  if (item.jsMobilityType === "Takeable") jsTemplates.push("TAKEABLE");
  if (item.jsMobilityType === "Player") jsTemplates.push("PLAYER");
  if (item.jsMobilityType === "NPC") jsTemplates.push("NPC");
  if (item.jsContainerType === "Container") jsTemplates.push("CONTAINER");
  if (item.jsContainerType === "Surface") jsTemplates.push("SURFACE");
  if (item.jsContainerType === "Openable") jsTemplates.push("OPENABLE");
  if (item.jsIsLockable) jsTemplates.push("LOCKED_WITH");
  if (item.jsIsWearable) jsTemplates.push("WEARABLE");
  if (item.jsIsEdible) jsTemplates.push("EDIBLE");
  if (item.jsIsCountable) jsTemplates.push("COUNTABLE");
  if (item.jsIsFurniture) jsTemplates.push("FURNITURE");
  if (item.jsIsSwitchable) jsTemplates.push("SWITCHABLE");
  if (item.jsIsComponent) jsTemplates.push("COMPONENT");
  for (let i = 0; i < jsTemplates.length; i++) {
    str += "  " + jsTemplates[i] + "\n";
  }
  
  str += FSHelpers.beautifyObject(item, 1);
  str += ");";
  return str;
}

FSHelpers.beautifyObject = function(item, indent) {
  let str = FSHelpers.tabs(indent) + "{\n";
  indent++;
  for (let key in item) {
    if (FSHelpers.ignoreKeys.includes(key)) continue;
    switch (typeof item[key]) {
      case "boolean": str += FSHelpers.tabs(indent) + key + ":" + (item[key] ? "true" : "false"); break;
      case "string": 
        if (/^function\(/.text(item[key])) {
          str += FSHelpers.tabs(indent) + key + ":" + item[key];
        }
        else {
          str += FSHelpers.tabs(indent) + key + ":\"" + item[key] + "\"";
        }
        break;
      //case "function": str += FSHelpers.tabs(indent) + key + ":" + FSHelpers.beautifyFunction(item[key].toString(), indent); break;
      case "number": str += FSHelpers.tabs(indent) + key + ":" + item[key]; break;
      case "object": 
        if (item[key] instanceof Exit) {
          str += FSHelpers.beautifyExit(key, item[key], indent); break;
        }
        else if (item[key] instanceof RegExp) {
          str += FSHelpers.tabs(indent) + key + ":/" + item[key].source + "/"; break;
        }
    }
    str += ",\n";
  }
  indent--;
  str += FSHelpers.tabs(indent) + "}\n";
  return str;
}

FSHelpers.beautifyExit = function(dir, exit, indent) {
  let res = FSHelpers.tabs(indent) + dir + ":new Exit(\"" + exit.name + "\"";
  if (exit.data) {
    return FSHelpers.beautifyObject(exit, indent) + "\")";
  }
  else {
    return res + ")";
  }
}

FSHelpers.beautifyFunction = function(str, indent) {
  if (indent === undefined) indent = 0;
  let res = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") {
      indent++;
      res += "{\n" + FSHelpers.tabs(indent);
    }
    else if (str[i] === "}") {
      res = res.trim();
      indent--;
      res += "\n" + FSHelpers.tabs(indent) + "}\n" + FSHelpers.tabs(indent);
    }
    else if (str[i] === ";") {
      res += ";\n" + FSHelpers.tabs(indent);
    }
    else {
      res += str[i];
    }
  }
  return res.trim();
}

// Used by beautifyX to help formatting JavaScript
FSHelpers.tabs = function(n) {
  let res = "";
  for (let i = 0; i < n; i++) res += "  ";
  return res;
}






