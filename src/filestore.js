import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import XML2JSON from './translators/xml2json'
import JSON2JS from './translators/json2js'
import * as Constants from './constants'

const homedir = require('os').homedir()
const platform = require('os').platform()
const arch = require('os').arch()

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
      let objs = JSON.parse(str)
      //objs = JSON2JS.loadStyleFromCss(undefined,objs)
      return objs
    }
    else {
      alert('Unknown file format')
    }
  }

  static async writeASLFile (objects, filename) {
    //console.log(filename)
    //console.log(typeof(filename))
    if (filename.endsWith(Constants.EXTENSION_ASLX)) {
      filename = filename.replace(Constants.EXTENSION_ASLX, Constants.EXTENSION_ASL6)
      if (fs.existsSync(filename)) {
        return "A file already exists with the .asl6 extension. You should rename, move or delete that so this file can safely be saved with the new extension."
      }
    }
    const str = JSON.stringify(objects, null, 2)
    await mkdirp(path.dirname(filename));
    fs.writeFileSync(filename, str, "utf8")
    if (platform != 'win32'){
      let exportNotification = new Notification('QEdit', {
        body: 'Export completed.\n\nView files?'
      })
      exportNotification.onclick = () => {
        const {shell} = require('electron')
        shell.showItemInFolder(filename)
      }
    // } else {
    //   const {shell} = require('electron')
    //   shell.showItemInFolder(filename)
    }
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
      fs.mkdirSync(outputPath + "assets/css", { recursive: true })
      console.log('Folders created')
    }
    else {
      console.log('Folders already exist')
    }
    const filenames = [
      'lang',
      'page.html',
      'lib',
      'assets',
    ]
    for (let filename of filenames) {
      console.log("About to copy " + filename + '...');
      let inputDir = path.join(__dirname, Constants.QUEST_JS_PATH);
      let oPath = outputPath
      fs.copy(inputDir + filename, oPath + filename, (err) => {
        if (err) throw err
        console.log("...Done")
      })
    }
    console.log('About to write files')
    fs.writeFileSync(outputPath + "game/data.js", JSON2JS.parseData(objects), "utf8")
    fs.writeFileSync(outputPath + "game/settings.js", JSON2JS.parseSettings(objects), "utf8")
    fs.writeFileSync(outputPath + "game/code.js", JSON2JS.parseCode(objects), "utf8")
    let css = require('css')
    let inputDir = path.join(__dirname, Constants.QUEST_JS_PATH)
    console.log(objects)
    let newCss = JSON2JS.parseStyle(objects).toString()
    fs.writeFileSync(outputPath + "assets/css/style.css", newCss, "utf8") 
    if (platform != 'win32'){
        let exportNotification = new Notification('QEdit', {
        body: 'Export completed.\n\nView files?'
      })
      exportNotification.onclick = () => {
        const {shell} = require('electron')
        shell.showItemInFolder(outputPath + 'page.html')
      }
    } else {
      const {shell} = require('electron')
      shell.showItemInFolder(outputPath + 'page.html')
    }
    
    return('Export completed')
  }
}
