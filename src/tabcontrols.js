const {lang} = require("./lang-en.js");


export class TabControls {
  constructor(files) {
    this.controls = [
      {
        tabName:"Home",
        displayIf:"!o.jsIsSettings", 
        tabControls:[
          { name:"name",   type:"text",     default:"unnamed", display:"Name",
            validator:function(value, obj) { return !/^[a-zA-Z_][\w]*$/.test(value); },
            tooltip:"The object's name; this is how it is identified in code. It can only contain letters, digits and underscores; it cannot start with a number.",
          },
          
          { name:"loc",    type:"otherobjects",  default:"---", display:"Location",
            validator:function(value, obj) { return value === obj.name; },
            tooltip:"Where the object is at the start of the game, the location or container. Should usually be blank for locations (as they are not inside anything).",
          },
          
          { name:"jsPronoun", type:"select",   default:"thirdperson", display:"Pronouns",
            options:Object.keys(lang.pronouns),
            tooltip:"How should the game refer to this?",
            displayIf:"!o.jsIsRoom && !o.jsIsStub",
          },

          { name:"title2", type:"title", display:"Editor settings" },

          { name:"jsColour", type:"select",   default:"blue", display:"Editor colour",
            options:[
              'blue', 'red', 'limegreen', 'orange', 'plum',
              'hotpink', 'seagreen', 'navy', 'tan', 'sienna', 'dimgray', 'silver', 
            ],
            tooltip:"Colour of the text in the left pane.",
          },
          
          { name:"jsIsZone", type:"flag",   default:false, display:"Zone?",  
            tooltip:"Zones are a way to group rooms, making it easier to build large maps (in fact, they are just rooms in a different colour).",
            displayIf:"o.jsIsRoom || o.jsIsStub",
          },
          
          { name:"title1", type:"title", display:"Templates",
            displayIf:"!o.jsIsRoom && !o.jsIsStub",
          },
          
          { name:"jsMobilityType", type:"select",   default:"Immobile", display:"Mobility",  
            options:["Immobile", "Takeable", "Player", "NPC", "Topic"],
            tooltip:"If the item never moves, it is immobile. If it can be taken by the player or a character, it is takeable.",
            displayIf:"!o.jsIsRoom && !o.jsIsStub",
          },
          
          { name:"jsIsEdible", type:"flag",   default:false, display:"Edible?",  
            tooltip:"Can this item be eaten or drunk?",
            displayIf:"!o.jsIsRoom && !o.jsIsStub && o.jsMobilityType === 'Takeable'",
          },
          
          { name:"jsIsCountable", type:"flag",   default:false, display:"Countable?",  
            tooltip:"An item is countable if there are several of them at a few locations, and they are to be grouped together.",
            displayIf:"!o.jsIsRoom && !o.jsIsStub && o.jsMobilityType === 'Takeable'",
          },
        ]
      },
      
      {
        tabName:"Text",
        displayIf:"!o.jsIsSettings", 
        tabControls:[
          { name:"desc",   type:"scriptstring", default:"", display:"Description",
            tooltip:"A description of the location.",
            displayIf:"o.jsIsRoom && !o.jsIsStub",
            parameters:'',
            return:'boolean'
          },
          { name:"examine",   type:"scriptstring", default:"", display:"Description",
            tooltip:"A description of the item.",
            displayIf:"!o.jsIsRoom && !o.jsIsStub",
            parameters:'isMultiple',
            return:'boolean'
          },
          { name:"jsComments",   type:"textarea", default:"", display:"Comments",
            tooltip:"Your notes; this will not be part of the game when you publish it.",
          },
        ]
      },
      
      {
        tabName:"Exits",
        displayIf:"o.jsIsRoom", 
        tabControls:[
          { name:"exits",   type:"exits", default:"", display:"Exits", },
        ]
      },
      
      { 
        tabName:"Conversion",
        displayIf:"o.jsConversionNotes && o.jsConversionNotes.length > 0", 
        tabControls:[
          { name:"jsConversionNotes",   type:"todolist", default:"", display:"Conversion Notes", },
        ]
      },
    ];
    
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
            console.log("File: " + filename + ".json");
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