'use strict'

const fs = require('fs');
const [QuestObject] = require('./questobject')

const useWithDoor = "useWithDoor";
const DSPY_SCENERY = 5;

const QUEST_JS_PATH = '../../QuestJS/'

/*

I think synchronous will be good enough because we are saving/loading locally
and it is reasonable to expect the user to wait whilst it happens.

*/

export class FileStore {
  
  getTabFiles() {
    return fs.readdirSync('src/tabs')
  }

  // This should read both Quest 5 and Quest 6 XML files,
  // which hopefully are pretty much the same
  readFile(filename, settings) {
    const str = fs.readFileSync(filename, "utf8");
    return this.readXmlString(str, filename, settings)
  }  
  
  // Separated out so it can be unit tested more easily
  readXmlString(str, filename, settings) {
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
    
    const errs = xmlDoc.getElementsByTagName("parsererror");
    for (let err of errs) {
      console.log("XML Error: " + err.innerHTML)
    }    
    
    const arr = xmlDoc.getElementsByTagName("object");
    for (let xml of arr) {
      objects.push(new QuestObject(xml, version));
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
    
    console.log("Loaded " + objects.length + " objects (including setting)");
    return objects;
  }


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
    if (filename.endsWith('.aslx')) {
      filename = filename.replace('.aslx', '.asl6')
      if (fs.existsSync(filename)) {
        return "A file already exists with the .asl6 extension. You should rename, move or delete that so this file can safely be saved with the new extension."
      }
    }
    console.log(filename)
    
    let str = "<!--Saved by Quest 6.0.0-->\n<asl version=\"600\">\n"

    for (let i = 0; i < objects.length; i++) {
      str += objects[i].toXml();
    }
    str += "</asl>"
    fs.writeFileSync(filename, str, "utf8");
    return "Saved: " + filename
  }

  writeFileJS(objects, filename) {
    const outputPath = filename.replace(/\\/g, '/').replace('.asl6', '/')
    console.log('Export to JavaScript files')
    if (!fs.existsSync(outputPath)) {
      console.log('Folders need creating')
      fs.mkdirSync(outputPath, { recursive: true })
      fs.mkdirSync(outputPath + "lib", { recursive: true })
      fs.mkdirSync(outputPath + "lang", { recursive: true })
      fs.mkdirSync(outputPath + "game", { recursive: true })
      fs.mkdirSync(outputPath + "images", { recursive: true })
      console.log('Folders created')
      const filenames = [
        'lang/lang-en.js',
        'page.html',
        'lib/command.js',
        'lib/commands.js',
        'lib/defaults.js',
        'lib/io.js',
        'lib/npc.js',
        'lib/parser.js',
        'lib/saveload.js',
        'lib/templates.js',
        'lib/text.js',
        'lib/util.js',
        'lib/world.js',
        'lib/settings.js',
        'images/favicon.png',
        'lib/style.css',
      ]      
      for (let filename of filenames) {
        console.log("About to copy " + filename + '...');
        fs.copyFile(QUEST_JS_PATH + filename, outputPath + filename, (err) => {
          if (err) throw err;
          console.log("...Done");
        });
      }
    }    
    else {
      console.log('Folders already exist')
    }
    
    let str1 = "\"use strict\";";
    let str2 = "\"use strict\";";
    let str3 = "";
    let str4 = "\"use strict\";";
    for (let i = 0; i < objects.length; i++) {
      str1 += objects[i].toJs();
      str2 += objects[i].toJsSettings();
      str3 += objects[i].toCss();
      str4 += objects[i].toCode();
    }
    fs.writeFileSync(outputPath + "game/data.js", str1, "utf8");
    fs.writeFileSync(outputPath + "game/settings.js", str2, "utf8");
    fs.writeFileSync(outputPath + "game/style.css", str3, "utf8");
    fs.writeFileSync(outputPath + "game/code.js", str4, "utf8");
    return('Export completed')
  }

  
}







