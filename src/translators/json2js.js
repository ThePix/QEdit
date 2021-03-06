import TabControls from '../tabcontrols'
import * as Constants from '../constants'
//import { Exits } from '../inputcomponents'
import fs from 'fs-extra'
import path from 'path'


export default class JSON2JS {
    // Converts items to JavaScript code
    // Unit tested
  static parseData(objects) {
    let str = Constants.JSSTRICT
    for (var i = 0; i < objects.length; i++) {
      if (objects[i].jsObjType !== Constants.ROOM_TYPE
        && objects[i].jsObjType !== Constants.ITEM_TYPE) continue

      str += Constants.ITEMSPACING
      str += "create" + (objects[i].jsObjType === Constants.ROOM_TYPE ? Constants.JSROOM : Constants.JSITEM) + "(\"" + objects[i].name + "\", "

      const jsTemplates = []
      if (objects[i].jsMobilityType === Constants.MOBILITY_TAKABLE) jsTemplates.push(Constants.JSTAKABLE)
      if (objects[i].jsMobilityType === Constants.MOBILITY_PLAYER) jsTemplates.push(Constants.JSPLAYER)
      if (objects[i].jsMobilityType === Constants.MOBILITY_NPC) jsTemplates.push(Constants.JSNPC)
      if (objects[i].jsContainerType === Constants.CONTAINER_CONTAINER) jsTemplates.push(Constants.JSCONTAINER)
      if (objects[i].jsContainerType === Constants.CONTAINER_SURFACE) jsTemplates.push(Constants.JSSURFACE)
      if (objects[i].jsContainerType === Constants.CONTAINER_OPENABLE) jsTemplates.push(Constants.JSOPENABLE)
      if (objects[i].jsIsLockable) jsTemplates.push(Constants.JSLOCKED)
      if (objects[i].jsIsWearable) {
        const layer = objects[i].jsWear_layer ? objects[i].jsWear_layer : 1
        const slots = objects[i].jsWear_slots ? beautifyArray(objects[i].jsWear_slots) : '[]'
        jsTemplates.push(Constants.JSWERABLE + "(" + layer + ", " + slots + ")")

      }
      if (objects[i].jsIsEdible) jsTemplates.push(Constants.JSEDIBLE)
      if (objects[i].jsIsCountable) jsTemplates.push(Constants.JSCOUNTABLE)
      if (objects[i].jsIsFurniture) jsTemplates.push(Constants.JSFURNITURE)
      if (objects[i].jsIsSwitchable) jsTemplates.push(Constants.JSSWITCHABLE)
      if (objects[i].jsIsComponent) jsTemplates.push(Constants.JSCOMPONENT)
      if (jsTemplates.length > 0) str += jsTemplates.join(', ') + ", "

      str += beautifyObject(objects[i], 0)

      str += ")"
    }
    return str
  }

  // Converts items to JavaScript code
  static parseSettings(objects) {
    let str = Constants.JSSTRICT
    for (var i = 0; i < objects.length; i++) {
      if (objects[i].jsObjType !== Constants.SETTINGS_TYPE) continue

      str += Constants.ITEMSPACING

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
      if (objects[i].jsInvHeld) str += "  {name:'Items Held', alt:'itemsHeld', test:settings.isHeldNotWorn, getLoc:function() { return game.player.name; } },\n"
      if (objects[i].jsInvWorn) str += "  {name:'Items Worn', alt:'itemsWorn', test:settings.isWorn, getLoc:function() { return game.player.name; } },\n"
      if (objects[i].jsInvHere) str += "  {name:'Items Here', alt:'itemsHere', test:settings.isHere, getLoc:function() { return game.player.loc; } },\n"
      str += "]\n"

      const _ = require('lodash')

      if (objects[i].jsStatusList) {
        str += "settings.status = [\n"
        for (let s of objects[i].jsStatusList) {
          str += '  function() { return "<td>' + s + ':</td><td>" + game.player.' + _.camelCase(s) + ' + "</td>"; },\n'
        }
        str += "]\n"
      }

      str += "settings.template = [\n"
      let line = ''
      for (let j = 1; j < 5; j++) {
        let newline
        if (objects[i].jsRoomTitlePos === j) {
          if (objects[i].jsRoomTitleYouAreIn) {
            line += "You are in {hereName}."
          }
          else if (objects[i].jsRoomTitleNewLine) {
            line += "#{cap:{hereName}}"
          }
          else  {
            line += "{b:{cap:{hereName}}}"
          }
          newline = objects[i].jsRoomTitleNewLine
        }
        if (objects[i].jsRoomItemsPos === j) {
          line += "{objectsHere:You can see {objects} here.}"
          newline = objects[i].jsRoomItemsNewLine
        }
        if (objects[i].jsRoomExitsPos === j) {
          line += "{exitsHere:You can go {exits}.}"
          newline = objects[i].jsRoomExitsNewLine
        }
        if (objects[i].jsRoomDescPos === j) {
          line += "{terse:{hereDesc}}"
          newline = objects[i].jsRoomDescNewLine
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

      for (let key in objects[i]) {
        if (typeof key === 'undefined' || key === 'undefined') {
          continue
        }

        if (/^js[A-Z]/.test(key) || key === 'name') continue

        // Some settings are either false or a string, and in the editor set in two places
        if (/^js[a-z]/.test(key)) {
          if (objects[i][key] === false) str += 'settings.' + key.replace(/^js/, "") + " = false\n"
          continue
        }
        if (objects[i]['js' + key] === false) {
          continue
        }

        str += 'settings.' + key.replace("__", ".") + " = "
        switch (typeof objects[i][key]) {
          case "boolean": str += (objects[i][key] ? "true" : "false"); break
          case "string":  str += "\"" + objects[i][key] + "\""; break
          case "number": str += objects[i][key]; break
          default: str += '[' + objects[i][key].map(el => '"' + el + '"').join(', ') + ']'
        }
        str += "\n"
      }
    }
    return str
  }

  // Converts items to CSS settings
  static parseStyle(objects) {
    let str = ''
    for (var i = 0; i < objects.length; i++) {
      if (objects[i].jsObjType !== 'settings') continue
      //console.log("parseStyle")
      //console.log(objects[i])
      str += ''

      if (objects[i].jsGoogleFonts && objects[i].jsGoogleFonts.length > 1) {
        str += "@import url('https://fonts.googleapis.com/css?family=" + objects[i].jsGoogleFonts.map(el => el.replace(/ /g, '+')).join('|') + "');\n\n"
      }
      str += "body {\n"
      if (objects[i].jsStyleMain_color) str += "  color:" + objects[i].jsStyleMain_color + ";\n"
      if (objects[i].jsStyleMain_background_color) str += "  background-color:" + objects[i].jsStyleMain_background_color + ";\n"
      if (objects[i].jsStyleMain_font_family) str += "  font-family:" + objects[i].jsStyleMain_font_family + ";\n"
      if (objects[i].jsStyleMain_font_size) str += "  font-size:" + objects[i].jsStyleMain_font_size + "pt;\n"
      str += "}\n\n\n"
      str += ".side-panes {\n"
      if (objects[i].jsStyleSide_color) str += "  color:" + objects[i].jsStyleSide_color + ";\n"
      if (objects[i].jsStyleSide_background_color) str += "  background-color:" + objects[i].jsStyleSide_background_color + ";\n"
      if (objects[i].jsStyleSide_font_family) str += "  font-family:" + objects[i].jsStyleSide_font_family + ";\n"
      if (objects[i].jsStyleSide_font_size) str += "  font-size:" + objects[i].jsStyleSide_font_size + "pt;\n"
      str += "}\n\n\n"
    }
    return str;
  }
  // static loadStyleFromCss(filename="assets/css/default.css", objs) {
  //   // Filename should most likely be "assets/css/default.css".
  //  // console.log("Running loadStyleFromCss . . .")
  //   let target
  //   objs.forEach(obj => {
  //     if (obj.name === 'Settings'){
  //       target = obj
  //       //console.log("Found Settings:")
  //     }
  //   })
  //   if (!target.name) return objs
  //   let css = require('css')
  //   let inputDir = path.join(__dirname, '../' + Constants.QUEST_JS_PATH)
  //   let styleCss = fs.readFileSync(inputDir + filename).toString()
  //   let cssObject = css.parse(styleCss)
  //   Object.values(cssObject).forEach(val => {
  //     val.rules.forEach(rule => {
  //       rule.selectors.forEach(el => {
  //         // If this is body or .side-panes, set the declarations to jsStyleMain_* or jsStyleSide_*
  //         if (el === 'body') {
  //           rule.declarations.forEach(declaration => {
  //             switch (declaration.property) {
  //               case 'color':
  //                  target.jsStyleMain_color = declaration.value
  //                 break
  //               case 'background-color':
  //                 target.jsStyleMain_background_color  = declaration.value
  //                 break
  //               case 'font-family':
  //                 target.jsStyleMain_font_family  = declaration.value
  //                 break
  //               case 'font-size':
  //                 target.jsStyleMain_font_size  = declaration.value
  //                 break
  //               default:
  //                 // Do nothing
  //             }
  //           })
  //         }
  //         if (el === '.side-panes') {
  //           rule.declarations.forEach(declaration => {

  //             switch (declaration.property) {
  //               case 'color':
  //                  target.jsStyleSide_color = declaration.value
  //                 break
  //               case 'background-color':
  //                 target.jsStyleSide_background_color  = declaration.value
  //                 break
  //               case 'font-family':
  //                 target.jsStyleSide_font_family  = declaration.value
  //                 break
  //               case 'font-size':
  //                 target.jsStyleSide_font_size  = declaration.value
  //                 break
  //               default:
  //                 // Do nothing
  //             }
  //           })
  //         }
  //       })
        
  //    })
  //   })
  //   return objs;
  // }
  // Converts items to code.js settings
  // This will be functions and commands
  static parseCode(objects) {
    let str = Constants.JSSTRICT

    for (var i = 0; i < objects.length; i++) {
      if (objects[i].jsObjType !== 'command') continue
    }
    //TODO!!!
    return str;
  }
}

function beautifyObject(object, indent) {
  return beautifyObjectHelper(object, indent);
}

function beautifyObjectHelper(item, indent) {
  let str = tabs(indent) + "{\n"
  indent++
  for (let key in item) {
    if (key === 'name') continue
    if (/^js[A-Z]/.test(key)) {
      if (key === 'jsVisible' && item[key] === false) str += tabs(indent) + 'isAtLoc:function() { return false; },\n'
      if (key === 'jsTopicScript') str += tabs(indent) + 'script' + beautifyScript(item[key])
      continue
    }

    switch (typeof item[key]) {
     
      case "boolean": str += tabs(indent) + key + ":" + (item[key] ? "true" : "false") + ","; break
      case "string":
        if (/^function\(/.test(item[key])) {
          str += tabs(indent) + key + ":" + item[key] + ","
        }
        else {
          str += tabs(indent) + key + ":\"" + item[key] + "\","
        }
        break
      //case "function": str += tabs(indent) + key + ":" + this.beautifyFunction(item[key].toString(), indent); break;
      case "number": str += tabs(indent) + key + ":" + item[key] + ","; break
      case "object":
        if (key === Constants.EXIT_TYPE + 's') {
          let tmpExits = item[key]
          for (let i in tmpExits){
            str += beautify(tmpExits[i], tmpExits[i].name, indent);
          }
          break
        }
        else if (item[key] instanceof RegExp) {
          str += tabs(indent) + key + ":/" + item[key].source + "/,"; break
        }
        else if (item[key] instanceof Array) {
          str += tabs(indent) + key + ':' + beautifyArray(item[key]) + ','; break
        }
        else if (item[key].type === 'script') {
          str += tabs(indent) + key + beautifyScript(item[key]) + ','; break
        }
        else if (item[key].type === 'js') {
          str += tabs(indent) + key + ":function(" + (item[key].params ? item[key].params : '') + ") {\n" + indentLines(item[key].code, indent + 1) + tabs(indent) + "},"; break
        }
        else if (item[key].type === 'msg' || key === 'desc') {
          
          str += tabs(indent) + key + ":\"" + item[key].code + "\","
        }
    }
    str += "\n"
  }
  indent--
  str += tabs(indent) + "}"
  return str
}

function beautifyArray(arr) {
  return ('[' + arr.map(el => '"' + el + '"').join(', ') + ']')
}

function beautifyScript(script) {
  return (":undefined, // WARNING: This script has not been included as it is in ASLX, not JavaScript")
}
/*
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
*/
function beautify(item, dir, indent) {
    //console.log(this.data)
    let s = tabs(indent) + dir + ":new Exit(\"" + item.data.name + "\""
    if (item.data.useType === "default") return s + "),"
    if (item.data.useType === "msg") return s + ", {\n" + tabs(indent+1) + "msg:\"" + item.data.msg + "\",\n" + tabs(indent) + "}),"
    if (item.data.useType === "custom") {
      s += ", {\n" + tabs(indent+1) + "use:function() {\n" + indentLines(item.data.use, indent + 2)
      s += tabs(indent + 1) + "},\n" + tabs(indent) + "}),"
      return s
    }
  }

  // Used by beautifyX to help formatting JavaScript
 function tabs(n) {
    let res = "";
    for (let i = 0; i < n; i++) res += "  ";
    return res;
  }

  function indentLines(s, indent) {
    //console.log(s)
    return tabs(indent) + s.trim().replace(/\r?\n/g, '\n' + tabs(indent)) + "\n"
  }
