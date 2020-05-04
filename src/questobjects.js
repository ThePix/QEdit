import { EventEmitter } from 'events'
import FileStore from './filestore'
import TabControls from './tabcontrols'
import Preferences from './preferences'
import * as Constants from './constants'

export default class QuestObjects {
  constructor (props) {
    this.controls = new TabControls().controls
    this.eventEmitter = new EventEmitter()
    this.clear()
  }

  on(eventName, listener) {
     this.eventEmitter.on(eventName, listener);
  }

  off(eventName, listener) {
    this.eventEmitter.off(eventName, listener);
  }

  emit(event, payload, error = false) {
    this.eventEmitter.emit(event, payload, error);
  }

  clear() {
    this.load()
  }

  load(filename) {
    filename = filename || Constants.DEFAULTFILE
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
    this.emit(Constants.UPDATE_OBJECTS_EVENT)
  }

  getSettings() {
    return this.getObjects().find(el => el.jsObjType === Constants.SETTINGS_TYPE)
  }

  setSettings(settings) {
    var oldSettings = this.getSettings()
    if (!oldSettings) {
      this.addObject(Constants.SETTINGS_TYPE)
      oldSettings = this.getSettings()
    }
    this.addDefaults(settings)
    oldSettings = settings
    this.emit(Constants.UPDATE_OBJECT_EVENT)
  }

  getFilename() {
    return this.filename
  }

  setFilename(filename) {
    if (filename === Constants.DEFAULTFILE) this.filename = undefined
    else this.filename = filename
    this.emit(Constants.UPDATE_OBJECTS_EVENT)
  }

  getObjectByName(name) {
    return this.getObjects().find(el => el.name === name)
  }

  getFirstLocationAbove(name) {
    name = name || this.getCurrentObject().name
    const object = getObjectByName(name)
    if(object.jsObjType === Constants.ROOM_TYPE) return name
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
      name: Constants.NEW_PREFIX + type,
      jsObjType: type,
      jsMobilityType: Constants.MOBILITY_IMMOBILE,
    }

    if (type === Constants.SETTINGS_TYPE) newObject.name = 'Settings'

    this.uniqueNameFor(newObject)

    switch (type) {
      case Constants.ROOM_TYPE:
        switch (Preferences.get(Constants.NEWROOMWHERE)) {
          case Constants.WHERE_LOCATION:
            newObject.loc = this.getFirstLocationAbove()
            break
          case Constants.WHERE_ZONE:
            newObject.loc = this.getFirstZoneAbove()
            break
        }
        break
      case Constants.ITEM_TYPE:
        switch (Preferences.get(Constants.NEWITEMWHERE)) {
          case Constants.WHERE_LOCATION:
            newObject.loc = this.getFirstLocationAbove()
            break
          case Constants.WHERE_ZONE:
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
    const object = this.getObjectByName(name)

    if (object.jsObjType === Constants.SETTINGS_TYPE) {
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
      this.emit(Constants.UPDATE_OBJECT_EVENT)
      this.emit(Constants.CHANGE_CURRENT_OBJECT_EVENT)
    }
  }

  setCurrentObjectByName(name) {
    this.setCurrentObject(this.getObjectByName(name))
  }

  getFirstObject() {
    return this.questObjects[0]
  }

  removeConversionNotes() {
    const current = this.getCurrentObject()
    if (window.confirm('Delete the conversion notes for "' + current.name + '"?')) {
      delete current.jsConversionNotes
      this.emit(Constants.UPDATE_OBJECT_EVENT)
    }
  }

  toggleCollaps(name, toggle) {
    var obj = this.getObjectByName(name)
    if (obj) obj.jsCollapsed = toggle
    this.emit(Constants.UPDATE_OBJECTS_EVENT)
  }

  setName(name) {
    this.getCurrentObject().name = name
    this.emit(Constants.UPDATE_OBJECT_EVENT)
  }

  getName() {
    return (this.getCurrentObject().name)
  }

  getValue(name) {
    return (this.getCurrentObject()[name])
  }

  setValue(name, value) {
    const current = this.getCurrentObject()

    if (value === null) delete current[name]
    else current[name] = value
    this.emit(Constants.UPDATE_OBJECT_EVENT)
  }

  uniqueNameFor(object) {
    // Is it already unique?
    if (!this.getObjects().find(el => (el.name === object.name
      && el !== object))) return

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

  getObjectNames() {
    return this.questObjects.map((o, i) => o.name)
  }

  getObjectOnlyNames() {
    let objects
    if (Preferences.get(Constants.SHOWROOMSONLY)) {
      objects = this.questObjects.filter(el =>
        el.jsObjType === Constants.ROOM_TYPE)
    }
    else {
      objects =  this.questObjects.filter(el =>
        el.jsObjType !== Constants.SETTINGS_TYPE)
    }
    return objects.map((o, i) => o.name)
  }

  getOtherObjectOnlyNames(object) {
    return this.questObjects.filter(
      el => ((el.jsObjType === Constants.ROOM_TYPE ||
        el.jsObjType === Constants.ITEM_TYPE ||
        el.jsObjType === Constants.STUB_TYPE) &&
        el !== this.getCurrentObject())
      ).map((o, i) => o.name)
  }

  createExit(name, data) {
    data = data || {}
    data.useType = data.useType || Constants.USETYPE_DEFAULT
    const exits = this.getValue('exits') || []
    const exit = {
      type: Constants.EXIT_TYPE,
      name: name,
      data: data
    }
    exits.push(exit)

    this.setValue('exits', exits)
    return exit
  }

  deleteExit(name) {
    if (window.confirm('Delete the exit "' + name + '"?')) {
      const exits = this.getValue('exits')
      if(exits) {
        const index = exits.findIndex(el => el.name === name)
        if(index !== -1) {
          exits.splice(index, 1)
          this.emit(Constants.UPDATE_OBJECT_EVENT)
        }
      }
    }
  }

  getExit(name) {
    const exits = this.getValue('exits')
    return((exits) ? exits.find(el => el.name === name) : undefined)
  }

  setExitData(name, data) {
    if (data === null) this.deleteExit(name)
    else {
      const exit = this.getExit(name) || this.createExit(name)
      exit.data = Object.assign({}, exit.data, data)
    }
    this.emit(Constants.UPDATE_OBJECT_EVENT)
  }

  createScript(name, value) {
    value = value || {}
    value.parameters = value.parameters || ''
    value.type = value.type || Constants.DEFAULT_TYPE
    value.code = value.code || ''
    this.setValue(name, value)
  }

  setScript(name, value) {
    if(value === null) {
      this.setValue(name, null)
      return
    }
    var script = this.getCurrentObject()[name]
    if (!script) {
      this.createScript(name, value)
      return
    }
    value.parameters = value.parameters || script.parameters
    value.type = value.type || script.type
    value.code = value.code || script.code
    this.setValue(name, value)
  }
  //---------------------------------------------------------------------
  //----------           For React                  ---------------------

// TODO: should maybe be moved to tabcontrols
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
}
