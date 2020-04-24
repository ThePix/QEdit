import { EventEmitter } from 'events'
import FileStore from './filestore'
import TabControls from './tabcontrols'


const SETTINGS_TYPE = 'settings'
const ROOM_TYPE = 'room'
const ITEM_TYPE = 'item'
const STUB_TYPE = 'stub'
const NEW_PREFIX = '__new__'
const MOBILITY_IMMOBILE = 'Immobile'
const DEFAULTFILE = __dirname + '/../blank.asl6'

const ALT_COLOURS = {
  blue:'lightblue',
  black:'white',
}

const UPDATE_OBJECTS_EVENT ='update_objects'
const UPDATE_OBJECT_EVENT = 'update_object'

export default class QuestObjects extends EventEmitter {
  constructor (controls, preferences) {
    super(controls, preferences)
    this.controls = controls
    this.preferences = preferences
    this.clear()
  }

  clear() {
    this.load()
  }

  load(filename) {
    filename = filename || DEFAULTFILE
    this.setFilename(filename)
    const objects = FileStore.readASLFile(filename)
    this.setObjects(objects)
    this.setCurrentObject(objects[0])

    this.setSettings()
  }

  getObjects() {
    return this.questObjects
  }

  setObjects(objects) {
    this.questObjects = objects
    this.emit(UPDATE_OBJECTS_EVENT)
  }

  getSettings() {
    return this.getObjects().find(el => el.jsObjType === SETTINGS_TYPE)
  }

  setSettings(settings) {
    var oldSettings = this.getSettings()
    if (!oldSettings) {
      this.addObject(SETTINGS_TYPE)
      oldSettings = this.getSettings()
    }
    this.addDefaults(settings)
    oldSettings = settings
    this.emit(UPDATE_OBJECT_EVENT)
  }

  getFilename() {
    return this.filename
  }

  setFilename(filename) {
    if (filename === DEFAULTFILE) this.filename = undefined
    else this.filename = filename
    this.emit(UPDATE_OBJECTS_EVENT)
  }

  getObjectByName(name) {
    return this.getObjects().find(el => el.name === name)
  }

  getFirstLocationAbove(name) {
    name = name || this.getCurrentObject().name
    const object = getObjectByName(name)
    if(object.jsObjType === ROOM_TYPE) return name
    else if(object.loc) return getFirstLocationAbove(object.loc)
    else return undefined
  }

  getFirstZoneAbove(name) {
    name = name || this.getCurrentObject().name
    const object = getObjectByName(name)
    if(object.jsIsZone) return name
    else if(object.loc) return getFirstZoneAbove(object.loc)
    else return undefined
  }

  addObject(type) {
    const newObject = {
      name: NEW_PREFIX + type,
      jsObjType: type,
      jsMobilityType: MOBILITY_IMMOBILE,
    }

    if (type === SETTINGS_TYPE) newObject.name = 'Settings'

    this.uniqueNameFor(newObject)

    switch (type) {
      case ROOM_TYPE:
        switch (preferences.get('jsNewRoomWhere')) {
          case 'Location':
            newObject.loc = this.getFirstLocationAbove()
            break
          case 'Zone':
            newObject.loc = this.getFirstZoneAbove()
            break
        }
        break
      case ITEM_TYPE:
        switch (preferences.get('jsNewItemWhere')) {
          case 'Location':
            newObject.loc = this.getFirstLocationAbove()
            break
          case 'Zone':
            newObject.loc = this.getFirstZoneAbove()
            break
        }
        break;
    }
    this.setObjects(this.getObjects().concat([newObject]))
    this.setCurrentObject(newObject)
  }

  removeObject(name) {
    name = name || this.getCurrentObject().name

    object = this.getObjectByName(name)

    if (object.jsObjType === SETTINGS_TYPE) {
      window.alert("Cannot delete the 'Settings' object.")
      return
    }

    if (window.confirm('Delete the object "' + name + '"?')) {
      this.setCurrentObject(
        this.getCurrentObject() === object ? this.getFirstObject() : this.getCurrentObject()
      )
      this.setObjects(this.getObjects().filter((o, i) => {return name !== o.name}))
    }
  }

  duplicateObject(name) {
    name = name || this.getCurrentObject().name

    const newObject = JSON.parse(JSON.stringify(getObjectByName(name)))
    uniqueNameFor(newObject)

    this.setObjects(this.getObjects().concat([newObject]))
    this.setCurrentObject(newObject)
  }

  getCurrentObject() {
    return this.currentObject
  }

  setCurrentObject(obj) {
    if (obj) {
      this.currentObject = obj
      this.emit(UPDATE_OBJECT_EVENT)
      this.emit(UPDATE_OBJECTS_EVENT)
    }
  }

  setCurrentObjectByName(name) {
    this.setCurrentObject(this.getObjectByName(name))
  }

  getFirstObject() {
    return this.questObjects[0]
  }

  removeConversionNotes(name) {
    if (window.confirm('Delete the conversion notes for "' + name + '"?')) {
      var obj = this.getObjectByName(name)
      if (obj) delete obj.jsConversionNotes
      this.emit(UPDATE_OBJECT_EVENT)
    }
  }

  toggleCollaps(name, toggle) {
    var obj = this.getObjectByName(name)
    if (obj) obj.jsCollapsed = toggle
    this.emit(UPDATE_OBJECTS_EVENT)
  }

  setValue(name, value) {
    const current = this. getCurrentObject()

    /*
    if (/_exit_/.test(name)) {
      const dir = /_exit_(.*)$/.exec(name)[1]
      //console.log("dir=" + dir);
      //console.log("was=" + newObject[dir].name);
      newObject[dir].name = value
      //console.log("now=" + newObject[dir].name);
    }
    else {
*/      // Do it!
      if (value === null) delete current[name]
      else current[name] = value
//    }
    this.emit(UPDATE_OBJECT_EVENT)
  }

  static getById(state, id) {
    return state.objects.find(el => el.id === id)
  }

  uniqueNameFor(object) {
    // Is it already unique?
    if (!this.getObjects().find(el => (el.name === object.name && el !== object))) return

    const res = /(\d+)$/.exec(object.name)
    // Does not end in a number
    if (!res) {
      object.name += '0'
    }
    else {
      const n = parseInt(res[0]) + 1;
      object.name = object.name.replace(/(\d+)$/, "" + n)
    }
    this.uniqueNameFor(object)
  }

  isInvalidName() {
    var found = false
    const objects = this.getObjects()
    const current = this.getCurrentObject()
    for(var i = 0; i < objects.length; i++) {
      if (objects[i] !== current && objects[i].name == current.name) {
        found = true;
        break;
      }
      return found
    }
  }

  getObjectNames() {
    return this.questObjects.map((o, i) => o.name)
  }

  getObjectOnlyNames() {
    if (this.preferences.get('jsShowRoomsOnly')) {
      return this.questObjects.filter(
        el => el.jsObjType === SETTINGS_ROOM).map((o, i) => o.name)
    }
    return this.questObjects.filter(
      el => el.jsObjType !== SETTINGS_TYPE).map((o, i) => o.name)
  }

  getOtherObjectOnlyNames() {
    return this.questObjects.filter(
      el => ((el.jsObjType === ROOM_TYPE ||
        el.jsObjType === ITEM_TYPE ||
        el.jsObjType === STUB_TYPE) &&
        el !== this.getCurrentObject())
      ).map((o, i) => o.name)
  }

  createExit(exitname, name, data) {
    data = data || {}
    if (!data.useType) data.useType = 'default'

    this.setValue(exitname, {
      type:'exit',
      name: name,
      data: data
    })
  }

  deleteExit(name) {
    if (window.confirm('Delete the exit "' + name + '"?')) {
      delete this.getCurrentObject()[name]
      this.emit(UPDATE_OBJECT_EVENT)
    }
  }

  setExitValue(exitname, name, value) {
    // TODO: This needs to change
/*    console.log("X----------------------------");
    console.log(name);
    if (typeof name !== "string") {
      const target = name.target;
      console.log(target.id);
      console.log(target.value);
      const l = target.id.split("_");
      name = l[1];
      action = l[0];
      data = target.value;
    }

    console.log(name);
    console.log(action);
    console.log(data);
/*
    // clone the state
    const newObjects = JSON.parse(JSON.stringify(this.state.objects));
    const newObject = newObjects.find(el => {
      return (el.name == objName);
    });
*/
    const exit = this.getCurrentObject()[exitname]
    if (value === null) delete exit[name]
    else exit[name] = value
/*
    switch (action) {
      case "useType":
        exit.data.useType = data
        break
      case "doorName":
        exit.data.doorName = data
        break
      case "doorObject":
        exit.data.door = data
        break
      case "msgScript":
        exit.data.msg = data
        break
      case "useScript":
        exit.data.use = data
        break
    }
    */
    this.emit(UPDATE_OBJECT_EVENT)
  }

  //---------------------------------------------------------------------
  //----------           For React                  ---------------------

// TODO: should be moved to tabcontrols
  addDefaults(obj) {
    obj = obj || this.getCurrentObject()
    if (!this.controls) return
    for (let i = 0; i < this.controls.length; i++) {
      if (this.displayIf(this.controls[i], obj)) {
        for (let j = 0; j < this.controls[i].tabControls.length; j++) {
          const tabControl = this.controls[i].tabControls[j]
          if (this.displayIf(tabControl, obj) && obj[tabControl.name] === undefined) {
            obj[tabControl.name] = tabControl.default
          }
        }
      }
    }
  }
/*
  getCurrentTab(controls) {
    let tab = (this.jsTabName ? this.jsTabName : controls[0].tabName);
    let control = controls.find(el => el.tabName === tab);

    if (!control) console.log("Failed to find control: " + tab);
    if (!this.displayIf(control)) {
      control = controls.find(el => {return this.displayIf(el);} );
    }
    if (control === undefined) {
      console.log("Still not found a suitable default tab, so just going with zero");
      control = controls[0];
    }
    this.jsTabName = control.tabName
    return control;
  }
*/
  displayIf(control, o) {
    if (!control.displayIf) return true
    try {
      o = o || this.getCurrentObject()
      return eval(control.displayIf)
    }
    catch (err) {
      console.log("------------------------------")
      console.log("Error in displayIf")
      console.log(err.message)
      console.log(this.name)
      console.log(control.displayIf)
    }
  }
/*
  treeStyleClass() {
    if (this.jsObjType === 'settings') {
      return "treeSettings";
    }
    else if (this.jsObjType === 'room') {
      return this.jsIsZone ? "treeZone" : "treeRoom";
    }
    else {
      return this.jsObjType === 'stub' ? "treeStub" : "treeItem";
    }
  }

  uiColour(darkMode) {
    let colour = this.jsColour || 'blue'
    if (darkMode && ALT_COLOURS[colour]) colour = ALT_COLOURS[colour]
    return colour
  }
*/


  //---------------------------------------------------------------------
  //------------------  EXPORT FUNCTIONS  -------------------------
/*
  // Unit tested
  toXml() {
    let str = "  <object name=\"" + this.name + "\">\n";
    for (let property in this) {
      if (property !== "name" && this.hasOwnProperty(property)) {
        const value = this[property];
        if (value === undefined) {
          console.log("No value found for property " + property + " of " + this.name)
        }
        else if (typeof value === "string") {
          str += "    <" + property + " type=\"string\"><![CDATA[" + value + "]]></" + property + ">\n";
        }
        else if (typeof value === "boolean") {
          str += "    <" + property + " type=\"boolean\">" + value + "</" + property + ">\n";
        }
        else if (typeof value === "number") {
          str += "    <" + property + " type=\"int\">" + value + "</" + property + ">\n";
        }
        else if (value instanceof Exit) {
          str += value.toXml(property)
        }
        else if (value instanceof RegExp) {
          str += "    <" + property + " type=\"regex\">" + value.source + "</" + property + ">\n";
        }
        else if (value instanceof Array) {
          str += "    <" + property + " type=\"stringlist\">\n";
          for (let i = 0; i < value.length; i++) {
            str += "      <value>" + value[i] + "</value>\n";
          }
          str += "    </" + property + ">\n";
        }
        else if (value.type) {
          if (value.type === 'js') {
            str += "    <" + property + " type=\"js\">\n"
            str += "      <params type=\"string\">" + (value.params ? value.params : '') + "</params>\n"
            str += "      <code><![CDATA[" + value.code + "]]></code>\n"
            str += "    </" + property + ">\n";
          }
          else if (value.type === 'script') {
            str += "    <" + property + " type=\"script\">\n"
            str += "      <code><![CDATA[" + value.code + "]]></code>\n"
            str += "    </" + property + ">\n";
          }
        }
        else  {
          console.log("Not saving type: " + property + "/" + value);
        }
      }
    }

    //console.log(this);
//    return str + "  </object>\n\n";
return JSON.stringify(this, null, 2)
  }
*/

}


/*
  toXml(property) {
    let str = "    <exit alias=\"" + property + "\" to=\"" + this.name + "\">\n"
    if (this.data.useType !== "default") {
      str += "      <useType>" + this.data.useType + "</useType>\n"
      if (this.data.useType === "msg") str += "      <msg><![CDATA[" + this.data.msg + "]]></msg>\n"
      if (this.data.useType === "use") str += "      <use>" + this.data.use + "</use>\n"
      if (this.data.useType === "custom") str += "      <use><![CDATA[" + this.data.use + "]]></use>\n"
    }
    str += "    </exit>\n"
    return str
  }
*/
