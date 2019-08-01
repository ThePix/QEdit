'use strict'

const fs = require('fs');
import {QuestObject} from './questobject';


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


  // This should read both Quest 5 and Quest 6 XML files,
  // which hopefully are pretty much the same
  readFile(settings) {
    const str = fs.readFileSync(this.filename + ".aslx", "utf8");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(str, "text/xml");
    
    const version = parseInt(xmlDoc.getElementsByTagName("asl")[0].getAttribute('version'));
    
    console.log("Opening XML file, version " + version);
    
    const objects = [];
    if (version < 600) {
      const gameObject = xmlDoc.getElementsByTagName("game")[0];
      settings.TITLE = gameObject.getAttribute('name');
      settings.SUBTITLE = gameObject.getElementsByTagName("subtitle")[0].innerHTML;
      settings.AUTHOR = gameObject.getElementsByTagName("author")[0].innerHTML;
      objects.push(new QuestObject(settings));
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



  writeFile(objects) {
    let str = "<!--Saved by Quest 6.0.0-->\n<asl version=\"600\">\n"

    for (let i = 0; i < objects.length; i++) {
      str += objects[i].toXml();
    }
    fs.writeFileSync(this.filename + ".asl6", str, "utf8");
  }
  
  writeFileJS(objects) {
    let str = "\"use strict\";";
    for (let i = 0; i < objects.length; i++) str += objects[i].toJs();
    fs.writeFileSync(this.filename + "2", str, "utf8");
  }
  
  writeSettingsFile(objects) {
    let str = "\"use strict\";";
    for (let i = 0; i < objects.length; i++) str += objects[i].toJsSettings();
    fs.writeFileSync("settings.js", str, "utf8");
  }
  
  
  
  

  
}







