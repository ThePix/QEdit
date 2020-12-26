import fs from 'fs'
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
    console.log(filename)
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
    //console.log("outputPath:",outputPath);
    //console.log("EXTENSION_ASL6",Constants.EXTENSION_ASL6)
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
        //console.log("__dirname", __dirname)
        console.log("About to copy " + filename + '...');
        //console.log("Constants.QUEST_JS_PATH + filename:")
        //console.log(Constants.QUEST_JS_PATH + filename)
        let inputDir = path.join(__dirname, Constants.QUEST_JS_PATH);
        //console.log("inputDir:")
        //console.log(inputDir)
        //console.log("inputDir + filename:")
        //console.log(inputDir + filename)
        fs.copyFile(inputDir + filename, outputPath + filename, (err) => {
          if (err) throw err
          console.log("...Done")
        })
      }
    }
    else {
      console.log('Folders already exist')
    }

    console.log('About to write files')
    fs.writeFileSync(outputPath + "game/data.js", JSON2JS.parseData(objects), "utf8")
    fs.writeFileSync(outputPath + "game/settings.js", JSON2JS.parseSettings(objects), "utf8")
    fs.writeFileSync(outputPath + "game/style.css", JSON2JS.parseStyle(objects), "utf8")
    fs.writeFileSync(outputPath + "game/code.js", JSON2JS.parseCode(objects), "utf8")
    return('Export completed')
  }
}
