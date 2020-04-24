export default class XML2JSON {
  // Separated out so it can be unit tested more easily
  static parse(str) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(str, "text/xml")
    const version = parseInt(xmlDoc.getElementsByTagName("asl")[0].getAttribute('version'))
    const objects = []

    var settings
    if (version < 600) {
      settings = _importSettings(xmlDoc)
      objects.push(settings)
    }

    const errs = xmlDoc.getElementsByTagName("parsererror")
    for (let err of errs) {
      console.log("XML Error: " + err.innerHTML)
    }

    _getElementsOfType(xmlDoc, objects, version, settings, "object")
    _getElementsOfType(xmlDoc, objects, version, settings, "command")
    _getElementsOfType(xmlDoc, objects, version, settings, "function")
    _getElementsOfType(xmlDoc, objects, version, settings, "type")

    // If we imported from Quest 5, object names will have been modified
    // so there is a chance of a new name collision
    if (version < 600) {
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].jsOldName) {
          for (let j = 0; j < objects.length; j++) {
            if (objects[j].loc === objects[i].jsOldName) objects[j].loc = objects[i].name
            if (i !== j && objects[j].name === objects[i].name) objects[i].jsConversionNotes.push("Renaming has caused a naming collision!!!")
          }
        }
      }
    }

    console.log("Loaded " + objects.length + " objects (including setting)")
    return objects
  }
}

function  _getElementsOfType(xmlDoc, objects, version, settings, type) {
    const arr = xmlDoc.getElementsByTagName(type)
    for (let xml of arr) {
      const object = _translateObjectFromXml(xml, version, settings)
      if (object !== null && object !== undefined) objects.push(object)
    }
  }

  // Import setting from version < 600
  function _importSettings(xmlDoc) {
    const gameObject = xmlDoc.getElementsByTagName("game")[0]
    const settings = {
      name: 'Settings',
      jsObjType:'settings',
      title:gameObject.getAttribute('name'),
    }

    settings.subtitle = _importSetting(gameObject, "subtitle")
    settings.author = _importSetting(gameObject, "author")
    settings.version = _importSetting(gameObject, "version")
    settings.cmdEcho = _importSetting(gameObject, "echocommand","boolean")
    settings.textInput = _importSetting(gameObject, "showcommandbar", "boolean")

    settings.jsStyleMain_font_family = _importSetting(gameObject, "defaultfont")
    settings.jsStyleMain_font_size = _importSetting(gameObject, "defaultfontsize", "int")
    settings.jsStyleMain_color = _importSetting(gameObject, "defaultforeground")
    settings.jsStyleMain_background_color = _importSetting(gameObject, "defaultbackground")
    settings.jsStyleMain_background_image = _importSetting(gameObject, "backgroundimage")

    settings.moneyFormat = _importSetting(gameObject, "moneyformat")
    settings.jsnoAskTell = _importSetting(gameObject, 'feature_asktell', 'invert-boolean')
    settings.debug = _importSetting(gameObject, 'feature_devmode', 'boolean')

    settings.clearScreenOnRoomEnter = _importSetting(gameObject, "clearscreenonroomenter", "boolean")
    settings.jsRoomTitlePos = _importSetting(gameObject, "autodescription_youarein", "int")
    settings.jsRoomItemsPos = _importSetting(gameObject, "autodescription_youcansee", "int")
    settings.jsRoomExitsPos = _importSetting(gameObject, "autodescription_youcango", "int")
    settings.jsRoomDescPos = _importSetting(gameObject, "autodescription_description", "int")
    settings.jsRoomTitleNewLine = _importSetting(gameObject, "autodescription_youarein_newline", "boolean")
    settings.jsRoomItemsNewLine = _importSetting(gameObject, "autodescription_youcansee_newline", "boolean")
    settings.jsRoomExitsNewLine = _importSetting(gameObject, "autodescription_youcango_newline", "boolean")
    settings.jsRoomDescNewLine = _importSetting(gameObject, "autodescription_description_newline", "boolean")
    settings.jsRoomTitleYouAreIn = _importSetting(gameObject, "autodescription_youarein_useprefix", "boolean")

    if (gameObject.getElementsByTagName("defaultwebfont").length > 0) {
      settings.jsStyleMain_font_family = gameObject.getElementsByTagName("defaultwebfont")[0].innerHTML
      settings.jsGoogleFonts = [settings.jsStyleMain_font_family]
    }

    const statusattributes = gameObject.getElementsByTagName('statusattributes')
    if (statusattributes.length > 0) {
      settings.jsStatusList = settings.jsStatusList || []
      const items = statusattributes[0].getElementsByTagName('item')
      for (let item of items) {
        var key = item.getElementsByTagName('key')[0].innerHTML
  //        var value = item.getElementsByTagName('value')[0].innerHTML
        if (!settings.jsStatusList.includes(key)) {
          settings.jsStatusList.push(key)
        }
      }
      gameObject.removeChild(statusattributes[0])
    }

    const showmoney = gameObject.getElementsByTagName('showmoney')
    if (showmoney.length > 0) {
      const value = showmoney[0].innerHTML
      if (value === 'true' || value === '' || value === undefined) {
        settings.jsStatusList = settings.jsStatusList || []
        settings.jsStatusList.push('money')
      }
      gameObject.removeChild(showmoney[0])
    }

    const start = gameObject.getElementsByTagName('start')
    if (start.length > 0) {
      settings.setup = {type:'script', code:convertValue(start[0].innerHTML, 'script')}
      gameObject.removeChild(start[0])
    }

    for (let node of gameObject.children) {
      const attType = node.getAttribute('type')
      if (attType === 'int' || attType === 'boolean' || attType === 'string' || attType === 'stringist' || attType === 'stringdictionary') {
        const name = (node.tagName === "attr" ? node.getAttribute('name') : node.tagName)
        settings.jsConversionNotes = settings.jsConversionNotes || []
        settings.jsConversionNotes.push("Attribute '" + name + "' set on game object has not been converted ")
      }
    }

    return settings
  }

  // Used in importSettings only
  function _importSetting(gameObject, tagName, type) {
    const els = gameObject.getElementsByTagName(tagName)
    if (els.length === 0) return
    var setting
    if (type === "int") {
      setting = parseInt(els[0].innerHTML)
    }
    else if (type === "boolean") {
      setting = els[0].innerHTML === "true" || els[0].innerHTML === ""
    }
    else if (type === 'invert-boolean') {
      setting = els[0].innerHTML === 'false'
    }
    else {
      setting = els[0].innerHTML
    }
    gameObject.removeChild(els[0])
    return setting
  }

  // Used by readFile via the constructor to create one object from its XML
  // which could be Quest 5 or 6
  // This has been unit tested with Quest 5 XML for an NPM, a wearable and a room
  // For Quest 6 the different types of attributes have been tested
  function _translateObjectFromXml(xml, version, settings) {

    const object = {}
    object.jsConversionNotes = []

    object.name = xml.getAttribute('name')
    if (/ /.test(object.name)) {
      object.jsConversionNotes.push("Object name had spaces removed; update any references (locations have been updates automatically); check no naming collision.")
      object.jsOldName = object.name
      object.name = object.name.replace(/\s/g, "_")
    }


    // Parent -> loc
    if (xml.parentNode.nodeType === 1) {
      //console.log("Parent is: " + xml.parentNode.tagName)
      if (xml.parentNode.tagName === 'object') {
        object.loc = xml.parentNode.getAttribute('name')
        //console.log("Added parent: " + xml.parentNode.getAttribute('name'))
      }
    }

    // Attributes
    for (let node of  xml.childNodes) {
      if (node.nodeType === 1 && node.tagName !== 'object') {
        const attType = node.getAttribute('type')
        const value = node.innerHTML
        const name = (node.tagName === "attr" ? node.getAttribute('name') : node.tagName)

        if (name === "inherit") {
          object.inherit = object.inherit || []
          object.inherit.push(node.getAttribute('name'))
        }
        else if (attType === 'boolean') {
          object[name] = value === 'true' || value === ''
          //console.log("Boolean")
        }
        else if (attType === 'int') {
          object[name] = parseInt(value)
          //console.log("Int")
        }
        else if (attType === 'regex') {
          object[name] = new RegExp(value)
          //console.log("RegExp")
        }
        else if (attType === 'stringlist') {
          const els = node.getElementsByTagName('value')
          const arr = []
          for (let k = 0; k < els.length; k++) arr.push(els[k].innerHTML)
          object[name] = arr
          //console.log("stringlist for " + object.name)
        }
        else if (['script', 'js', 'blockly'].includes(attType)) {
          //console.log("Code " + attType)
          if (attType === 'script' && node.innerHTML) {
            object[name] = {type:attType, code:convertValue(node.innerHTML, attType)}
          }
          else {
            object[name] = xmlToDict(node, {type:attType})
          }
        }
        else if (name === 'exit') {
          object[node.getAttribute('alias')] = createExitFromXml(node)
          //console.log("Exit")
        }
        else if (name === 'statusattributes') {
          object.statusattributes = node
        }
        else if ((value === '' || value === undefined) && node.attributes.length === 0) {
          object[name] = true
        }
        else if (attType === 'string' || attType === '' || attType === null || attType === 'object') {
          object[name] = removeBR(removeCDATA(value))
        }
        else {
          object[name] = value
          object.jsConversionNotes.push("Attribute type '" + attType + "' not recognised; attribute may not have been converted properly: " + name)
        }
      }
    }

    // If this is a conversion from Quest 5 we need to handle the "inherit"
    // elements, which correspond approximately to templates
    if (version < 600) {
      object.inherit = object.inherit|| []
      if (xml.tagName === 'command') {
        if (object.name === 'help') return null
        object.jsObjType = 'command'
        if (object.pattern !== null) {
          object.regex = new RegExp(object.pattern)
          delete object.pattern
        }
      }
      else if (xml.tagName === 'function') {
        object.jsObjType = 'function'
        const parameters = xml.getAttribute('parameters')
        if (parameters) {
          object.parameters = parameters.split(',')
          object.parameters = object.parameters.map(el => el.replace(/^\s+|\s+$/g, ''))
        }
      }
      else if (xml.tagName === 'type'){
        object.jsObjType = 'template'
      }
      else {
        object.jsObjType = object.inherit.includes("editor_room") ? 'room' : 'item'
      }

      object.inherit = _removeFromArray(object.inherit, "editor_room")
      object.inherit = _removeFromArray(object.inherit, "editor_object")

      // I think we can safely remove these as the defaults handle it
      object.inherit = _removeFromArray(object.inherit, "talkingchar")
      object.jsPronoun = "thirdperson"

      if (object.jsObjType !== 'room') {
        if (object.take) {
          object.jsMobilityType = "Takeable"
        }

        else if (object.inherit.includes("editor_player") || object.feature_player) {
          object.jsMobilityType = "Player"
          object.inherit = _removeFromArray(object.inherit, "editor_player")
          object.jsPronoun = "secondperson"
          delete object.feature_player
          if (object.statusattributes !== undefined && settings !== undefined) {
            settings.jsStatusList = settings.jsStatusList || []
            const items = object.statusattributes.getElementsByTagName('item')
            for (let item of items) {
              var key = item.getElementsByTagName('key')[0].innerHTML
        //       var value = item.getElementsByTagName('value')[0].innerHTML
              if (!settings.jsStatusList.includes(key)) {
                settings.jsStatusList.push(key)
              }
            }
          }
        }

        else if (object.inherit.includes("namedfemale")) {
          object.jsMobilityType = "NPC"
          object.jsFemale = true
          object.properName = true
          object.inherit = _removeFromArray(object.inherit, "namedfemale")
          object.jsPronoun = "female"
        }

        else if (object.inherit.includes("namedmale")) {
          object.jsMobilityType = "NPC"
          object.jsFemale = false
          object.properName = true
          object.inherit = _removeFromArray(object.inherit, "namedmale")
          object.jsPronoun = "male"
        }

        else if (object.inherit.includes("female")) {
          object.jsMobilityType = "NPC"
          object.jsFemale = true
          object.properName = false
          object.inherit = _removeFromArray(object.inherit, "female")
          object.jsPronoun = "female"
        }

        else if (object.inherit.includes("male")) {
          object.jsMobilityType = "NPC"
          object.jsFemale = false
          object.properName = false
          object.inherit = _removeFromArray(object.inherit, "male")
          object.jsPronoun = "male"
        }

        else if (object.inherit.includes("topic") || object.inherit.includes("startingtopic")) {
          object.jsMobilityType = "Topic"
          if (object.inherit.includes("startingtopic")) {
            object.jsFromStart = true
          }
          else {
            object.jsFromStart = false
          }
          object.inherit = _removeFromArray(object.inherit, "startingtopic")
          object.inherit = _removeFromArray(object.inherit, "topic")
          if (object.exchange && object.talk) {
            const exchangecode = convertValue('msg("' + object.exchange + '")\n', 'script')
            object.jsTopicScript = object.talk
            object.jsTopicScript.code = exchangecode + object.jsTopicScript.code
          }
          else if (object.exchange) {
            object.jsTopicScript = object.exchange
          }
          else if (object.talk) {
            object.jsTopicScript = object.talk
          }
          delete object.exchange
          delete object.talk
          if (object.nowshow) object.nowshow = object.nowshow.map(el => el.replace(/\s/g, "_"))
          if (object.nowhide) object.nowhide = object.nowhide.map(el => el.replace(/\s/g, "_"))
        }

        else {
          object.jsMobilityType = "Immobile"
        }

        if (object.inherit.includes("surface")) {
          object.jsContainerType = "Surface"
          object.inherit = _removeFromArray(object.inherit, "surface")
        }

        else if (object.inherit.includes("container_open")) {
          object.jsContainerType = "Container"
          object.closed = false
          if (object.isopen !== undefined) {
            if (!object.isopen) {
              object.closed = true
            }
          }
          delete object.isopen
          object.openable = true
          object.inherit = _removeFromArray(object.inherit, "container_open")
        }

        else if (object.inherit.includes("container_closed")) {
          object.jsContainerType = "Container"
          object.closed = true
          if (object.isopen !== undefined) {
            if (object.isopen) {
              object.closed = false
            }
          }
          delete object.isopen
          object.openable = true
          object.inherit = _removeFromArray(object.inherit, "container_closed")
        }

        else if (object.inherit.includes("container_limited")) {
          object.jsContainerType = "Container"
          object.closed = false
          if (object.isopen !== undefined) {
            if (!object.isopen) {
              object.closed = true
            }
          }
          delete object.isopen
          object.openable = true
          object.inherit = _removeFromArray(object.inherit, "container_limited")
          object.jsConversionNotes.push("Currently editor may not translate limited container properly")
        }

        else if (object.inherit.includes("openable")) {
          object.jsContainerType = "Openable"
          object.inherit = _removeFromArray(object.inherit, "openable")
          object.closed = true
          if (object.isopen !== undefined) {
            if (object.isopen) {
              object.closed = false
            }
          }
          delete object.isopen
        }
        else {
          object.jsContainerType = "No"
        }

        if (object.inherit.includes("wearable")) {
          object.jsIsWearable = true
          object.inherit = _removeFromArray(object.inherit, "wearable")
          object.jsMobilityType = "Takeable"
          object.jsWear_layer = object.wear_layer
          object.jsWear_slots = object.wear_slots
          delete object.wear_layer
          delete object.wear_slots
          delete object.feature_wearable
        }
        else {
          object.jsIsWearable = false
        }

        if (object.inherit.includes("switchable")) {
          object.jsIsSwitchable = true
          object.inherit = _removeFromArray(object.inherit, "switchable")
        }
        else {
          object.jsIsSwitchable = false
        }

        if (object.inherit.includes("edible")) {
          object.jsIsEdible = true
          object.inherit = _removeFromArray(object.inherit, "edible")
          object.jsMobilityType = "Takeable"
        }
        else {
          object.jsIsEdible = false
        }

        if (object.inherit.includes("plural")) {
          object.jsPronoun = "plural"
          object.inherit = _removeFromArray(object.inherit, "plural")
        }
      }
      if (object.look) {
        if (object.examine) {
          object.jsConversionNotes.push("Cannot convert 'look' to 'examine' as object already has an 'examine' attribute")
        }
        else {
          object.examine = object.look
          delete object.look
        }
      }
      if (object.description) {
        if (object.desc) {
          object.jsConversionNotes.push("Cannot convert 'description' to 'desc' as object already has an 'desc' attribute")
        }
        else {
          object.desc = object.description
          delete object.description
        }
      }
      if (object.displayverbs || object.inventoryverbs) {
        object.jsConversionNotes.push("This object has custom inventory/display verbs set. These are handled very differently in Quest 6, so cannot be converted. You should modify the 'getVerbs' function yourself.")
        delete object.inventoryverbs
        delete object.displayverbs
      }
      if (object.inherit.length > 0) {
        object.jsConversionNotes.push("Failed to do anything with these inherited types: " + object.inherit)
      }
      else {
        delete object.inherit
      }
      delete object.statusattributes
      delete object.feature_container

      if (object.activeconversations) {
        settings.jsnoTalkTo = false
        delete object.activeconversations
      }

      if (object.visible !== undefined) {
        object.jsVisible = object.visible
        delete object.visible
      }

      if (object.usedefaultprefix !== undefined) {
        object.properName = !object.usedefaultprefix
        delete object.usedefaultprefix
      }
    }

    if (object.jsConversionNotes.length === 0) delete object.jsConversionNotes
    return object
  }

  function _removeFromArray(arr, el) {
    if (arr !== undefined) {
      const index = arr.indexOf(el)
      if (index > -1) {
        arr.splice(index, 1)
      }
    }
    return arr
  }

  function removeCDATA(s) {
    if (s.startsWith('<![CDATA[')) {
      return s.substring(9, s.length - 3)
    }
    else {
      return s
    }
  }

  function removeBR(s) {
    return s.replace(/\<br\/\>/i, "|")
  }

  function xmlToDict(xml, settings) {
    const res = settings ? settings : {}
    if (xml.attributes) {
      for (let att of xml.attributes) {
        res[att.name] = att.value
      }
    }
    if (xml.children) {
      for (let att of xml.children) {
        res[att.tagName] = convertValue(att.innerHTML, att.getAttribute('type'))
      }
    }
    return res
  }

 function convertValue(s, type) {
    if (type === 'string' && s === '') return ''
    if (s === '') return true
    if (type === 'int') return parseInt(s)
    if (type === 'boolean') return (s === 'true')
    return removeCDATA(s)
  }

  function createExitFromXml(node) {
    const data = xmlToDict(node)
    const name = node.getAttribute('to') || (' ' + data.to).slice(1) //Clone this
    if (!data.useType) data.useType = 'default'
    delete data.alias
    delete data.to

    return {
      type:'exit',
      name: name,
      data: data
    }
  }
