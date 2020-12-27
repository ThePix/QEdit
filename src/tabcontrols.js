const fs = require('fs-extra');
const {lang} = require("./lang-en.js");

// Assumes files are provided in alphabetical order, so aaa.js is first
// custom files may want to have _ at the start so they are added later
export default class TabControls {
  constructor() {
    const files = fs.readdirSync(__dirname + '/tabs')
    this.controls = [];
    this.libraries = []

    for (let filename of files) {
      const json = require(__dirname + '/tabs/' + filename);
      for (let data of json) {
        if (data.action === "tab") {
          this.controls.push(data);
        }
        if (data.action === "extend") {
          //const tabName = data.tabName
          const tab = this.controls.find(function(el) {
            return el.tabName === data.tabName;
          });
          if (!tab) {
            console.log("------------------------------");
            console.log("Error with extending tab");
            console.log("Failed to find a tab called: " + data.tabName);
            console.log("File: " + filename);
            console.log("Note that this is case sensitive!");
          }
          else {
            tab.tabControls.push(data);
          }
        }
        if (data.action === "library") {
          console.log('library')
          console.log(data)
          this.libraries.push({name:data.name, files:data.files})
          console.log(this.libraries)
        }
      }
    }

  }
}
