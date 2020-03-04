'use strict'

const fs = require('fs');
const [QuestObject] = require('./questobject')

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


  // This should read both Quest 5 and Quest 6 XML files,
  // which hopefully are pretty much the same
  readFile(filename, settings) {
    const str = fs.readFileSync(filename, "utf8");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(str, "text/xml");
    
    const version = parseInt(xmlDoc.getElementsByTagName("asl")[0].getAttribute('version'));
    
    console.log("Opening XML file (" + filename + "), version " + version);
    
    const objects = [];
    
    if (version < 600) {
      const obj = new QuestObject(settings);
      obj.importSettings(xmlDoc);
      objects.push(obj);
    }
    
    const arr = xmlDoc.getElementsByTagName("object");
    for (let i = 0; i < arr.length; i++) {
      objects.push(new QuestObject(arr[i], version));
    }
    
    // If we imported from Quest 5, object names will have been modified
    // so there is a chance of a new name collision
    if (version < 600) {
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].jsOldName) {
          for (let j = 0; j < objects.length; j++) {
            if (objects[j].loc === objects[i].jsOldName) objects[j].loc = objects[i].name;
            if (i !== j && objects[j].name === objects[i].name) objects[i].jsConversionNotes.push("Renaming has caused a naming collision!!!");
          }
        }
      }
    }
    
    return objects;
  }

/*
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
        const value = xml.childNodes[j].innerHTML;
        const name = (xml.childNodes[j].tagName === "attr" ? xml.childNodes[j].getAttribute('name') : xml.childNodes[j].tagName);
        
        if (name === "inherit") {
          object.inherit = xml.childNodes[j].getAttribute('name');
        }
        if (name === "ask" || name === "tell") {
          object[name + "options"] = this.importAskTell(xml.childNodes[j].getElementsByTagName('item'));
        }
        else if (attType === 'boolean') {
          object[name] = value === 'true' || value === '';
          //console.log("Boolean");
        }
        else if (attType === 'int') {
          object[name] = parseInt(value);
          //console.log("Int");
        }
        else if (attType === 'stringlist') {
          const els = xml.childNodes[j].getElementsByTagName('value');
          const arr = [];
          for (let k = 0; k < els.length; k++) arr.push(els[k].innerHTML);
          object[name] = arr;
          //console.log("stringlist for " + object.name);
        }
        else if (attType === 'script') {
          object[name] = { lang: 'script', code:this.removeCDATA(value) };
          //console.log("Script");
        }
        else if (attType === 'js') {
          object[name] = { lang: 'js', code:this.removeCDATA(value) };
          //console.log("JavaScript");
        }
        else if (attType === 'blockly') {
          object[name] = { lang: 'blockly', code:value };
          //console.log("XML code");
        }
        else if (name === 'exit') {
          object[xml.childNodes[j].getAttribute('alias')] = new Exit(xml.childNodes[j].getAttribute('to'), {});
          //console.log("Exit");
        }
        else if (attType === 'string' || attType === '' || attType === null || attType === 'object') {
          object[name] = this.removeBR(this.removeCDATA(value));
        }
        else {
          object[name] = value;
          object.jsConversionNotes.push("Attribute type '" + attType + "' not recognised; attribute may not have been converted properly: " + name);
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
      object.jsPronoun = "thirdperson";

      if (object.jsIsRoom) {
        object.jsExpanded = true;
      }
      else {
        if (object.take) {
          object.jsMobilityType = "Takeable";
        }
        
        else if (inherits.includes("editor_player")) {
          object.jsMobilityType = "Player";
          inherits = this.removeFromArray(inherits, "editor_player");
          object.jsPronoun = "secondperson";
        }
        
        else if (inherits.includes("namedfemale")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = true;
          object.properName = true;
          inherits = this.removeFromArray(inherits, "namedfemale");
          object.jsPronoun = "female";
        }
          
        else if (inherits.includes("namedmale")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = false;
          object.properName = true;
          inherits = this.removeFromArray(inherits, "namedmale");
          object.jsPronoun = "male";
        }
          
        else if (inherits.includes("female")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = true;
          object.properName = false;
          inherits = this.removeFromArray(inherits, "female");
          object.jsPronoun = "female";
        }
          
        else if (inherits.includes("male")) {
          object.jsMobilityType = "NPC";
          object.jsFemale = false;
          object.properName = false;
          inherits = this.removeFromArray(inherits, "male");
          object.jsPronoun = "male";
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
          object.jsMobilityType = "Takeable";
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
          object.jsMobilityType = "Takeable";
        }
        else {
          object.jsIsEdible = false;
        }

        if (inherits.includes("plural")) {
          object.jsIsPronoun = "plural";
          inherits = this.removeFromArray(inherits, "plural");
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
      if (object.displayverbs || object.inventoryverbs) {
        object.jsConversionNotes.push("This object has custom inventory/display verbs set. These are handled very differently in Quest 6, so cannot be converted. You should modify the 'getVerbs' function yourself.");
        delete object.inventoryverbs;
        delete object.displayverbs;
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
*/

/*
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
  }*/

  importAskTell(xml) {
    const res = {type: 'asktell', store:'simple', entries:[]}
    for (let item of xml) {
      res.entries.push({
        regex:item.getAttribute('key').replace(/ /g, '|'),
        aslScript:item.innerHTML
      })
    }
    console.log(res)
    return res
  }

  
  writeFile(app, objects, filename) {
    const settingsIndex = objects.findIndex(el => el.jsIsSettings)
    const settings = objects[settingsIndex]
    if (!filename) {
      //const settings = objects.find(el => el.jsIsSettings)
      filename = settings.jsFilename
      if (!filename) return "Failed to get filename"
    }
    if (filename.endsWith('.aslx')) {
      filename = filename.replace('.aslx', '.asl6')
      if (fs.existsSync(filename)) {
        return "A file already exists with the .asl6 extension. You should rename, move or delete that so this file can safely be saved with the new extension."
      }
      console.log(filename)
      objects[settingsIndex].jsFilename = filename
      console.log(objects)
      app.setState({
        objects:objects,
      });
    }
    
    let str = "<!--Saved by Quest 6.0.0-->\n<asl version=\"600\">\n"

    for (let i = 0; i < objects.length; i++) {
      str += objects[i].toXml();
    }
    fs.writeFileSync(filename, str, "utf8");
    return "Saved"
  }

  writeFileJS(objects) {
    let str1 = "\"use strict\";";
    let str2 = "\"use strict\";";
    let str3 = "";
    for (let i = 0; i < objects.length; i++) {
      str1 += objects[i].toJs();
      str2 += objects[i].toJsSettings();
      str3 += objects[i].toCss();
    }
    fs.writeFileSync("data.js", str1, "utf8");
    fs.writeFileSync("settings.js", str2, "utf8");
    fs.writeFileSync("style.Css", str2, "utf8");
  }

  
}







