'use strict'

const fs = require('fs');


/*

There is a very specific format for the output file,
but we do not need to use that exact format internally.

Internally, objects are held in an array.
Each object is a dictionary, with a "name" (a string) and a "jsTemplates"
(array of strings) attributes. Also a "jsComments" (string) to save any comment before the create.

We need to get the entire contents of data.js, and throw an error if something is not recognised
so the author does not lose anything.

Perhaps split data.js into obj.js, com.js and func.js (but merge cmd.js back in later?). 





I think synchronous will be good enough because we are saving/loading locally
and it is reasonable to expect the user to wait whilst it happens.




*/

export class FileStore {
  constructor (filename) {
    this.filename = filename
  }

  readFile() {
    const str = fs.readFileSync(this.filename, "utf8");
    const arr = str.split(/\r?\n/);
    
    const objects = [];
    let block = [];
    let s;
    
    for (let i = 0; i < arr.length; i++) {
      s = arr[i].trim();
      //console.log(s);
      // skip "use strict"
      if (/^(\"|\')use strict(\"|\')\;?$/.test(s)) continue;
      
      if (s.length === 0) {
        if (block.length === 0) continue;
        objects.push(FSHelpers.unpack(block));
        block = [];
        //console.log("New block!");
      }
      else {     
        block.push(s);
      }
    }
    if (block.length !== 0) objects.push(FSHelpers.unpack(block));
    
    for (let i = 0; i < objects.length; i++) {
      console.log(objects[i].name + " - " + objects[i].jsIsRoom);
    }

    return objects
  }
  
  writeFile(objects) {
    let str = "\"use strict\";";
    for (let i = 0; i < objects.length; i++) str += FSHelpers.pack(objects[i]);
    fs.writeFileSync(this.filename + "2", str, "utf8");
  }
}




class Exit {
  constructor (name, data) {
    this.name = name;
    this.data = data;
  }
}



const FSHelpers = {}

FSHelpers.ignoreKeys = [
  "name", "jsIsRoom", "jsComments", "jsMobilityType", "jsContainerType", "jsIsLockable",
  "jsIsWearable", "jsIsCountable", "jsIsFurniture", "jsIsSwitchable", "jsIsComponent"
];

FSHelpers.pack = function(item) {
  let str = "\n\n\n";

  const comments = item.jsComments.split("\n");
  for (let i = 0; i < comments.length; i++) {
    str += "// " + comments[i] + "\n";
  }
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
        if (/^function\(/.text(item[key]) {
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


FSHelpers.tabs = function(n) {
  let res = "";
  for (let i = 0; i < n; i++) res += "  ";
  return res;
}



FSHelpers.unpack = function(lines) {
  const item = {jsComments:'', name:"test"};
  let jsTemplates = [];
  let str = "", md;
  for (let i = 0; i < lines.length; i++) {
    // Collect comments in the jsComments array
    if (/^ *\/\//.test(lines[i])) {
      md = /^ *\/\/ ?(.*)/.exec(lines[i])
      item.jsComments += "\n" + md[1];
    }
    // Collect templates in the jsTemplates array
    else if (/^ *[A-Z][A-Z][A-Z]/.test(lines[i])) {
      jsTemplates.push(lines[i]);
    }
    // Get the create function call
    else if (/^ *create/.test(lines[i])) {
      md = /^ *create(Room|Item)\(\"(.+)\"/.exec(lines[i]);
      if (!md) {
        console.log("Bad formating with '" + lines[i] + "'");
      }
      else {
        item.jsIsRoom = (md[1] === "Room");
        item.name = md[2];
      }
    }
    else if (lines[i] === undefined) {
      console.log("Expected lines[i] to be!");
    }
    else {
      str += lines[i];
    }
  }
  if (/\)\;$/.test(str)) {
    str = str.substring(0, str.length - 2);
    if (!/^\{/.test(str)) {
      str = "{" + str;
    }
    try {
      eval("FSHelpers.values = " + str);
      console.log(FSHelpers.values);
      for (var key in FSHelpers.values) {
        const value = FSHelpers.values[key];
        item[key] = (typeof value === "function" ? FSHelpers.beautifyFunction(value.toString()) : value;
      }
    } catch (err) {
      console.log("Failed to process dictionary, with this error:");
      console.log(err);
      console.log("This is the text that failed (possibly split across several lines in the file and with a curly brace added at the start):");
      console.log(str);
    }
  }
  else {
    console.log("Expected str to end );");
  }
  
  jsTemplates = jsTemplates.join(",");
  console.log("jsTemplates=" + jsTemplates);
  if (jsTemplates.includes("TAKEABLE")) {
    item.jsMobilityType = "Takeable";
  }
  else if (jsTemplates.includes("PLAYER")) {
    item.jsMobilityType = "Player";
  }
  else if (jsTemplates.includes("NPC")) {
    item.jsMobilityType = "NPC";
  }
  else {
    item.jsMobilityType = "Immobile";
  }
  
  if (jsTemplates.includes("CONTAINER")) {
    item.jsContainerType = "Container";
  }
  else if (jsTemplates.includes("SURFACE")) {
    item.jsContainerType = "Surface";
  }
  else if (jsTemplates.includes("OPENABLE")) {
    item.jsContainerType = "Openable";
  }
  else {
    item.jsContainerType = "No";
  }
  
  item.jsIsLockable = jsTemplates.includes("LOCKED_WITH");
  item.jsIsWearable = jsTemplates.includes("WEARABLE");
  item.jsIsCountable = jsTemplates.includes("COUNTABLE");
  item.jsIsFurniture = jsTemplates.includes("FURNITURE");
  item.jsIsSwitchable = jsTemplates.includes("SWITCHABLE");
  item.jsIsComponent = jsTemplates.includes("COMPONENT");
  
  if (item.jsExpanded === undefined) item.jsExpanded = true;
  
  return item
}
  

