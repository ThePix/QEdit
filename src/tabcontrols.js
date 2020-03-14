const {lang} = require("./lang-en.js");


export class TabControls {
  constructor(files) {
    this.controls = [];
    
    for (let filename of files) {
      const json = require('./tabs/' + filename);
      for (let j = 0; j < json.length; j++) {
        if (json[j].action === "tab") {
          this.controls.push(json[j]);
        }
        if (json[j].action === "extend") {
          //const tabName = json[j].tabName
          const tab = this.controls.find(function(el) {
            return el.tabName === json[j].tabName;
          });
          if (!tab) {
            console.log("------------------------------");
            console.log("Error with extending tab");
            console.log("Failed to find a tab called: " + json[j].tabName);
            console.log("File: " + filename);
            console.log("Note that this is case sensitive!");
          }
          else {
            tab.tabControls.push(json[j]);
          }
        }
        
      }
    }
    
  }
  
  getControls() {
    //for (let i = 0; i < this.controls.length; i++) {
    //  console.log(this.controls[i].tabName);
    //}    
    return this.controls;
  }

}