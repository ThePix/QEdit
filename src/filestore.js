import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import XML2JSON from './translators/xml2json'
import JSON2JS from './translators/json2js'
import * as Constants from './constants'

/*

I think synchronous will be good enough because we are saving/loading locally
and it is reasonable to expect the user to wait whilst it happens.

*/


export default class FileStore {
  // This should read both Quest 5 and Quest 6 XML files,
  // which hopefully are pretty much the same
  static readASLFile(filename) {
    const str = fs.readFileSync(filename, "utf8")
    if (/^\s*\</.test(str)) {
      return XML2JSON.parse(str)
    }
    else if (/^\s*[\{,\[]/.test(str)) {
      return JSON.parse(str)
    }
    else {
      alert('Unknown file format')
    }
  }

  static async writeASLFile (objects, filename) {
    if (filename.endsWith(Constants.EXTENSION_ASLX)) {
      filename = filename.replace(Constants.EXTENSION_ASLX, Constants.EXTENSION_ASL6)
      if (fs.existsSync(filename)) {
        return "A file already exists with the .asl6 extension. You should rename, move or delete that so this file can safely be saved with the new extension."
      }
    }

    const str = JSON.stringify(objects, null, 2)
    await mkdirp(path.dirname(filename));
    fs.writeFileSync(filename, str, "utf8")
    return "Saved: " + filename
  }

  static writeJSFile(objects, filename) {
    const outputPath = filename.replace(/\\/g, '/').replace('.' + Constants.EXTENSION_ASL6, '/').replace('.' + Constants.EXTENSION_ASLX, '/')
    console.log('Export to JavaScript files')
    if (!fs.existsSync(outputPath)) {
      console.log('Folders need creating')
      fs.mkdirSync(outputPath, { recursive: true })
      fs.mkdirSync(outputPath + "lib", { recursive: true })
      fs.mkdirSync(outputPath + "lang", { recursive: true })
      fs.mkdirSync(outputPath + "game", { recursive: true })
      fs.mkdirSync(outputPath + "assets", { recursive: true })
      console.log('Folders created')
      
    }
    else {
      console.log('Folders already exist')
    }
    const filenames = [
      'lang',
      'page.html',
      //'style.css',
      'lib',
      'assets',
    ]
    for (let filename of filenames) {
      console.log("About to copy " + filename + '...');
      let inputDir = path.join(__dirname, Constants.QUEST_JS_PATH);
      let oPath = outputPath
      if (filename === 'style.css') {
        oPath+= 'game/'
      }
      fs.copy(inputDir + filename, oPath + filename, (err) => {
        if (err) throw err
        console.log("...Done")
      })
      if (filename === 'style.css') {
        console.log("Caught 'style.css'!")
        let css = require('css')
        let newCss = JSON2JS.parseStyle(objects).toString()
        let styleCss = fs.readFileSync(inputDir + "style.css").toString()
        let badAssCss = css.parse(styleCss)
        console.log(badAssCss)
        //console.log(styleCss)
        //console.log(newCss)
        //console.log(newCss + `\n\n` + styleCss)
        fs.writeFileSync(outputPath + "game/style.css", newCss + `\n\n` + styleCss, "utf8") // backwards for the moment
      }
    }
    

    console.log('About to write files')
    fs.writeFileSync(outputPath + "game/data.js", JSON2JS.parseData(objects), "utf8")
    fs.writeFileSync(outputPath + "game/settings.js", JSON2JS.parseSettings(objects), "utf8")
    
    fs.writeFileSync(outputPath + "game/code.js", JSON2JS.parseCode(objects), "utf8")
    return('Export completed')
  }
}
