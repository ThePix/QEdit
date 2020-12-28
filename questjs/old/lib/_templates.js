"use strict";

// Should all be language neutral




const TAKEABLE_DICTIONARY = {
  onCreation:function(o) {
    //console.log('takeable: ' + o.name)
    o.verbFunctions.push(function(o, verbList) {
      verbList.push(o.isAtLoc(game.player.name) ? lang.verbs.drop : lang.verbs.take)
    })
    //console.log(o.verbFunctions.length)
  },

  takeable:true,
  
  drop:function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
    this.moveToFrom(char.loc, char.name);
    return true;
  },
  
  take:function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    if (this.isAtLoc(char.name)) {
      msg(prefix(this, isMultiple) + lang.already_have, tpParams);
      return false;
    }
    if (!char.canManipulate(this, "take")) return false;
    msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
    this.moveToFrom(char.name, this.takeFromLoc(char));
    if (this.scenery) delete this.scenery;
    return true;
  },
  
  takeFromLoc:function(char) { return this.loc }
  
};


const TAKEABLE = () => TAKEABLE_DICTIONARY;



const SHIFTABLE = function() {
  const res = {
    shiftable:true,
  };
  return res;
}








const createEnsemble = function(name, members, dict) {
  const res = createItem(name, dict);
  res.ensemble = true;
  res.members = members;
  res.parsePriority = 10;
  res.inventorySkip = true;
  res.takeable = true;
  res.getWorn = function(situation) { return this.isAtLoc(this.members[0].loc, situation) && this.members[0].getWorn(); }

  res.nameModifierFunctions = [function(o, list) {
    if (o.members[0].getWorn() && o.isAllTogether() && o.members[0].isAtLoc(game.player.name)) list.push(lang.invModifiers.worn)
  }]
  
  // Tests if all parts are n the same location and either all are worn or none are worn
  // We can use this to determine if the set is together or not too
  res.isAtLoc = function(loc, situation) {
    if (situation !== world.PARSER && situation !== world.SCOPING) return false;
    const worn = this.members[0].getWorn();
    for (let member of this.members) {
      if (member.loc !== loc) return false;
      if (member.getWorn() !== worn) return false;
    }
    return true;
  }
  
  // Tests if all parts are together
  res.isAllTogether = function() {
    const worn = this.members[0].getWorn();
    const loc = this.members[0].loc;
    for (let member of this.members) {
      if (member.loc !== loc) return false;
      if (member.breakEnsemble && member.breakEnsemble()) return false;
      if (member.getWorn() !== worn) return false;
    }
    return true;
  }
  
  res.drop = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
    for (let member of this.members) {
      member.moveToFrom(char.loc);
    }
    return true;
  }
  
  res.take = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    if (this.isAtLoc(char.name)) {
      msg(prefix(this, isMultiple) + lang.already_have, tpParams);
      return false;
    }

    if (!char.canManipulate(this, "take")) return false;
    msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
    for (let member of this.members) {
      member.moveToFrom(char.name);
      if (member.scenery) delete member.scenery;
    }
    return true;
  }

  for (let member of members) {
    member.ensembleMaster = res;
  }
  return res;
}


const MERCH = function(value, locs) {
  const res = {
    price:value,
    getPrice:function() { return this.price },

    // The price when the player sells the item
    // By default, half the "list" price
    // 
    getSellingPrice:function(char) { 
      if (w[char.loc].buyingValue) {
        return Math.round(this.getPrice() * (w[char.loc].buyingValue) / 100);
      }
      return Math.round(this.getPrice() / 2); 
    },
    
    // The price when the player buys the item
    // Uses the sellingDiscount, as te shop is selling it!
    getBuyingPrice:function(char) {
      if (w[char.loc].sellingDiscount) {
        return Math.round(this.getPrice() * (100 - w[char.loc].sellingDiscount) / 100);
      }
      return this.getPrice(); 
    },
    
    isAtLoc:function(loc, situation) {
      if ((situation === world.PARSER || situation === world.SCOPING) && this.isForSale(loc)) return true;
      if (typeof loc !== "string") loc = loc.name;
      if (!w[loc]) errormsg("The location name `" + loc + "`, does not match anything in the game.");
      if (this.complexIsAtLoc) {
        if (!this.complexIsAtLoc(loc, situation)) return false;
      }
      else {
        if (this.loc !== loc) return false;
      }
      if (situation === undefined) return true;
      if (situation === world.LOOK && this.scenery) return false;
      if (situation === world.SIDE_PANE && this.scenery) return false;
      return true;
    },

    isForSale:function(loc) {
      if (this.loc) return false  // if a location is set, the item is already sold
      if (this.doNotClone) return (this.salesLoc === loc);
      return (this.salesLocs.includes(loc));
    },
    
    canBeSoldHere:function(loc) {
      return w[loc].willBuy && w[loc].willBuy(this);
    },
    
    purchase:function(isMultiple, char) {
      const tpParams = {char:char, item:this}
      if (!this.isForSale(char.loc)) {
        if (this.doNotClone && this.isAtLoc(char.name)) {
          return failedmsg(lang.cannot_purchase_again, tpParams)
        }
        else {
          return failedmsg(lang.cannot_purchase_here, tpParams)
        }
      }
      
      const cost = this.getBuyingPrice(char);
      tpParams.money = cost
      if (char.money < cost) return failedmsg(prefix(this, isMultiple) + lang.cannot_afford, tpParams);
      this.purchaseScript(isMultiple, char, cost, tpParams)
    },
    
    purchaseScript:function(isMultiple, char, cost, tpParams) {
      char.money -= cost;
      msg(prefix(this, isMultiple) + lang.purchase_successful, tpParams);
      if (this.doNotClone) {
        this.moveToFrom(char.name, char.loc);
        delete this.salesLoc;
      }
      else {
        cloneObject(this, char.name);
      }
      return world.SUCCESS;
    },
    
    sell:function(isMultiple, char) {
      const tpParams = {char:char, item:this}
      if (!this.canBeSoldHere(char.loc)) {
        return failedmsg(prefix(this, isMultiple) + lang.cannot_sell_here, tpParams);
      }
      const cost = this.getSellingPrice(char);
      tpParams.money = cost
      char.money += cost;
      msg(prefix(this, isMultiple) + lang.sell_successful, tpParams);
      if (this.doNotClone) {
        this.moveToFrom(char.loc, char.name);
        this.salesLoc = char.loc;
      }
      delete this.loc
      return world.SUCCESS;
      
    },
  }
  if (!Array.isArray(locs)) {
    res.doNotClone = true;
    res.salesLoc = locs;
  }
  else {
    res.salesLocs = locs;
  }
  return res;
}  






// countableLocs should be a dictionary, with the room name as the key, and the number there as the value
const COUNTABLE = function(countableLocs) {
  const res = $.extend({}, TAKEABLE_DICTIONARY);
  res.countable = true;
  res.countableLocs = countableLocs;
  res.multiLoc = true
  
  res.extractNumber = function() {
    const md = /^(\d+)/.exec(this.cmdMatch);
    if (!md) { return false; }
    return parseInt(md[1]);
  };
  
  res.templatePreSave = function() {
    const l = [];
    for (let key in this.countableLocs) {
      l.push(key + "=" + this.countableLocs[key]);
    }
    this.customSaveCountableLocs = l.join(",");
    this.preSave();
  };

  res.templatePostLoad = function() {
    const l = this.customSaveCountableLocs.split(",");
    this.countableLocs = {};
    for (let el of l) {
      const parts = el.split("=");
      this.countableLocs[parts[0]] = parseInt(parts[1]);
    }
    delete this.customSaveCountableLocs;
    this.postLoad();
  };

  res.getListAlias = function(loc) {
    return sentenceCase(this.pluralAlias ? this.pluralAlias : this.listalias + "s") + " (" + this.countAtLoc(loc) + ")";
  };
  
  res.isAtLoc = function(loc, situation) {
    if (!this.countableLocs[loc]) { return false; }
    if (situation === world.LOOK && this.scenery) return false;
    if (situation === world.SIDE_PANE && this.scenery) return false;
    return (this.countableLocs[loc] > 0);
  };

  res.countAtLoc = function(loc) {
    if (!this.countableLocs[loc]) { return 0; }
    return this.countableLocs[loc];
  };
  
  res.moveToFrom = function(toLoc, fromLoc, count) {
    if (!count) count = this.extractNumber();
    if (!count) count = this.countAtLoc(fromLoc);
    this.takeFrom(fromLoc, count);
    this.giveTo(toLoc, count);
  };
  
  res.takeFrom = function(loc, count) {
    if (this.countableLocs[loc] !== INFINITY) this.countableLocs[loc] -= count;
    if (this.countableLocs[loc] <= 0) { delete this.countableLocs[loc]; }
    w[loc].itemTaken(this, count);
  };
  
  res.giveTo = function(loc, count) {
    if (!this.countableLocs[loc]) { this.countableLocs[loc] = 0; }
    if (this.countableLocs[loc] !== INFINITY) this.countableLocs[loc] += count;
    w[loc].itemDropped(this, count);
  };
  
  res.findSource = function(sourceLoc, tryContainers) {
    // some at the specific location, so use them
    if (this.isAtLoc(sourceLoc)) {
      return sourceLoc;
    }

    if (tryContainers) {
      const containers = scopeReachable().filter(el => el.container);
      for (let container of containers) {
        if (container.closed) continue;
        if (this.isAtLoc(container.name)) return container.name;
      }
    }

    return false;
  }

  // As this is flagged as multiLoc, need to take special care about where the thing is
  res.take = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    const sourceLoc = this.findSource(char.loc, true);
    if (!sourceLoc) {
      msg(prefix(this, isMultiple) + lang.none_here, tpParams);
      return false;
    }
    let n = this.extractNumber()
    let m = this.countAtLoc(sourceLoc)

    if (!n) { n = m; }  // no number specified
    if (n > m)  { n = m; }  // too big number specified
    
    tpParams[this.name + '_count'] = n
    msg(prefix(this, isMultiple) +  lang.take_successful, tpParams);
    this.takeFrom(sourceLoc, n);
    this.giveTo(char.name, n);
    if (this.scenery) delete this.scenery;
    return true;
  };

  res.drop = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    let n = this.extractNumber();
    let m = this.countAtLoc(char.name);
    if (m === 0) {
      msg(prefix(this, isMultiple) + lang.none_held, tpParams);
      return false;
    }

    if (!n) { m === INFINITY ? 1 : n = m; }  // no number specified
    if (n > m)  { n = m; }  // too big number specified
    
    tpParams[this.name + '_count'] = n
    msg(prefix(this, isMultiple) + lang.drop_successful, tpParams);
    this.takeFrom(char.name, n);
    this.giveTo(char.loc, n);
    return true;
  };

  return res;
};



const WEARABLE = function(wear_layer, slots) {
  const res = $.extend({}, TAKEABLE_DICTIONARY)
  res.wearable = true
  res.armour = 0
  res.wear_layer = wear_layer ? wear_layer : false
  res.slots = slots && wear_layer ? slots: []
  res.useDefaultsTo = function(char) {
    return char === game.player ? 'Wear' : 'NpcWear'
  }
  
  res.getSlots = function() { return this.slots; };
  res.getWorn = function() { return this.worn; };
  res.getArmour = function() { return this.armour; };
  
  res.onCreation = function(o) {
    //console.log('wearable: ' + o.name)
    o.verbFunctions.push(function(o, verbList) {
      if (!o.isAtLoc(game.player.name)) {
        verbList.push(lang.verbs.take)
      }
      else if (o.getWorn()) {
        if (!o.getWearRemoveBlocker(game.player, false)) verbList.push(lang.verbs.remove)
      }
      else {
        verbList.push(lang.verbs.drop)
        if (!o.getWearRemoveBlocker(game.player, true)) verbList.push(lang.verbs.wear)
      }
    })
    //console.log(o.verbFunctions.length)

    o.nameModifierFunctions.push(function(o, list) {
      if (o.worn && o.isAtLoc(game.player.name)) list.push(lang.invModifiers.worn)
    })
  }

  res.icon = () => 'garment12'
  
  res.getWearRemoveBlocker = function(char, toWear) {
    if (!this.wear_layer) { return false; }
    const slots = this.getSlots();
    for (let slot of slots) {
      let outer = char.getOuterWearable(slot);
      if (outer && outer !== this && (outer.wear_layer >= this.wear_layer || outer.wear_layer === 0)) {
        return outer;
      }
    }
    return false;
  };
  
  res.canWearRemove = function(char, toWear) {
    const outer = this.getWearRemoveBlocker(char, toWear);
    if (outer) {
      const tpParams = {char:char, garment:this, outer:outer}
      if (toWear) {
        msg(lang.cannot_wear_over, tpParams);
      }
      else {
        msg(lang.cannot_remove_under, tpParams);
      }
      return false;
    }
    return true;
  };
  
  // Assumes the item is already held  
  res.wear = function(isMultiple, char) {
    if (!this.canWearRemove(char, true)) { return false; }
    if (!char.canManipulate(this, "wear")) { return false; }
    if (this.wearMsg) {
      msg(prefix(this, isMultiple) + this.wearMsg(char, this), {garment:this, actor:char});
    }
    else {
      msg(prefix(this, isMultiple) + lang.wear_successful, {garment:this, char:char});
    }
    this.worn = true;
    if (this.afterWear) this.afterWear(char);
    return true;
  };

  // Assumes the item is already held  
  res.remove = function(isMultiple, char) {
    if (!this.canWearRemove(char, false)) { return false; }
    if (!char.canManipulate(this, "remove")) { return false; }
    if (this.removeMsg) {
      msg(prefix(this, isMultiple) + this.removeMsg(char, this), {garment:this, actor:char});
    }
    else {
      msg(prefix(this, isMultiple) + lang.remove_successful, {garment:this, char:char});
    }
    this.worn = false;
    if (this.afterRemove) this.afterRemove(char);
    return true;
  };


  return res;
};

const OPENABLE_DICTIONARY = {
  open:function(isMultiple, char) {
    const tpParams = {char:char, container:this}
    if (!this.openable) {
      msg(prefix(this, isMultiple) + lang.cannot_open, tpParams);
      return false;
    }
    else if (!this.closed) {
      msg(prefix(this, isMultiple) + lang.already, {item:this});
      return false;
    }
    if (this.locked) {
      if (this.testKeys(char)) {
        this.closed = false;
        msg(prefix(this, isMultiple) + lang.unlock_successful, tpParams);
        this.openMsg(isMultiple, tpParams);
        return true;
      }
      else {
        msg(prefix(this, isMultiple) + lang.locked, tpParams);
        return false;
      }
    }
    this.closed = false;
    this.openMsg(isMultiple, tpParams);
    if (this.onOpen) this.onOpen(char)
    return true;
  },
  
  close:function(isMultiple, char) {
    const tpParams = {char:char, container:this}
    if (!this.openable) {
      msg(prefix(this, isMultiple) + lang.cannot_close, tpParams);
      return false;
    }
    else if (this.closed) {
      msg(prefix(this, isMultiple) + lang.already, {item:this});
      return false;
    }
    this.hereVerbs = ['Examine', 'Open'];
    this.closed = true;
    this.closeMsg(isMultiple, tpParams);
    if (this.onClose) this.onClose(char)
    return true;
  },
  
  closeMsg:function(isMultiple, tpParams) {
    msg(prefix(this, isMultiple) + lang.close_successful, tpParams);
  },
  
}

const CONTAINER = function(openable) {
  const res = $.extend({}, OPENABLE_DICTIONARY);
  res.container = true
  
  res.closed = openable;
  res.openable = openable
  res.contentsType = "container"
  res.getContents = util.getContents
  res.testForRecursion = util.testForRecursion
  res.listContents = util.listContents
  res.transparent = false
  
  res.onCreation = function(o) {
    //console.log('container: ' + o.name)
    o.verbFunctions.push(function(o, verbList) {
      if (o.openable) {
        verbList.push(o.closed ? lang.verbs.open : lang.verbs.close);
      }
    })
    //console.log(o.verbFunctions.length)
    o.nameModifierFunctions.push(util.nameModifierFunctionForContainer) 
    //console.log(o.nameModifierFunctions)
  },

  res.lookinside = function(isMultiple, char) {
    const tpParams = {char:char, container:this}
    if (this.closed && !this.transparent) {
      msg(prefix(this, isMultiple) + lang.nothing_inside, {char:char});
      return false;
    }
    //tpParams.list = formatList(this.getContents(world.LOOK), {article:INDEFINITE, lastJoiner:lang.list_and, nothing:lang.list_nothing})
    tpParams.list = this.listContents(world.LOOK, true)
    msg(prefix(this, isMultiple) + lang.look_inside, tpParams);
    return true;
  };
  
  res.openMsg = function(isMultiple, tpParams) {
    tpParams.list = this.listContents(world.LOOK)
    msg(prefix(this, isMultiple) + lang.open_successful + " " + lang.look_inside, tpParams)
  };
  
  res.icon = function() {
    return this.closed ? 'closed12' : 'opened12'
  };
  
  res.canReachThrough = function() { return !this.closed };
  res.canSeeThrough = function() { return !this.closed || this.transparent };

  return res;
};



const SURFACE = function() {
  const res = {}
  res.container = true
  res.getContents = util.getContents
  res.testForRecursion = util.testForRecursion
  res.listContents = util.listContents
  res.onCreation = function(o) { o.nameModifierFunctions.push(util.nameModifierFunctionForContainer) }
  res.closed = false;
  res.openable = false;
  res.contentsType = "surface",
  res.canReachThrough = () => true;
  res.canSeeThrough = () => true;
  return res;
};



const OPENABLE = function(alreadyOpen) {
  const res = $.extend({}, OPENABLE_DICTIONARY);
  res.closed = !alreadyOpen;
  res.openable = true;
  
  res.onCreation = function(o) {
    //console.log('openable: ' + o.name)
    o.verbFunctions.push(function(o, verbList) {
      verbList.push(o.closed ? lang.verbs.open : lang.verbs.close);
    })
    o.nameModifierFunctions.push(function(o, list) {
      if (!o.closed) list.push(lang.invModifiers.open)
    })
  }

  res.openMsg = function(isMultiple, tpParams) {
    msg(prefix(this, isMultiple) + lang.open_successful, tpParams);
  };

  return res;
};



const LOCKED_WITH = function(keyNames) {
  if (typeof keyNames === "string") { keyNames = [keyNames]; }
  if (keyNames === undefined) { keyNames = []; }
  const res = {
    keyNames:keyNames,
    locked:true,
    lock:function(isMultiple, char) {
      const tpParams = {char:char, container:this}
      if (this.locked) {
        msg(lang.already, tpParams);
        return false;
      }
      if (!this.testKeys(char, true)) {
        msg(no_key, tpParams);
        return false;
      }
      if (!this.closed) {
        this.closed = true;
        msg(close_successful, tpParams);
      }      
      msg(lock_successful, tpParams);
      this.locked = true;
      return true;
    },
    unlock:function(isMultiple, char) {
      const tpParams = {char:char, container:this}
      if (!this.locked) {
        msg(lang.already, tpParams);
        return false;
      }
      if (!this.testKeys(char, false)) {
        msg(no_key, tpParams);
        return false;
      }
      msg(unlock_successful, tpParams);
      this.locked = false;
      return true;
    },
    testKeys:function(char, toLock) {
      for (let s of keyNames) {
        if (!w[s]) {
          errormsg("The key name for this container, `" + s + "`, does not match any key in the game.");
          return false;
        }
        if (w[s].isAtLoc(char.name)) { 
          return true; 
        }
      }
      return false;
    }
  };
  return res;
};



const LOCKED_DOOR = function(key, loc1, loc2, name1, name2) {
  const res = $.extend({}, OPENABLE(false), LOCKED_WITH(key))
  res.loc1 = loc1
  res.loc2 = loc2
  res.name1 = name1
  res.name2 = name2
  res.scenery = true

  res._setup = function() {
    const room1 = w[this.loc1]
    if (!room1) return errormsg("Bad location name '" + this.loc1 + "' for door " + this.name)
    const exit1 = room1.findExit(this.loc2)
    if (!exit1) return errormsg("No exit to '" + this.loc2 + "' for door " + this.name)
    this.dir1 = exit1.dir
    if (!room1[this.dir1]) return errormsg("Bad exit '" + this.dir1 + "' in location '" + room1.name + "' for door: " + this.name + " (possibly because the room is defined after the door?)")

    const room2 = w[this.loc2]
    if (!room2) return errormsg("Bad location name '" + this.loc2 + "' for door " + this.name)
    const exit2 = room2.findExit(this.loc1)
    if (!exit2) return errormsg("No exit to '" + this.loc1 + "' for door " + this.name)
    this.dir2 = exit2.dir
    if (!room2[this.dir2]) return errormsg("Bad exit '" + this.dir2 + "' in location '" + room2.name + "' for door: " + this.name + " (possibly because the room is defined after the door?)")

    room1[this.dir1].use = util.useWithDoor
    room1[this.dir1].door = this.name
    room1[this.dir1].doorName = this.name1 || 'door to ' + lang.getName(w[this.loc2], {article:DEFINITE})

    room2[this.dir2].use = util.useWithDoor
    room2[this.dir2].door = this.name
    room2[this.dir2].doorName = this.name2 || 'door to ' + lang.getName(w[this.loc1], {article:DEFINITE})
  }
  
  res.isAtLoc = function(loc, situation) {
    if (typeof loc !== "string") loc = loc.name
    if (situation !== world.PARSER && this.scenery) return false;
    return (loc == this.loc1 || loc == this.loc2);
  }

  res.icon = () => 'door12'

  return res;
}  



const KEY = function() {
  const res = $.extend({}, TAKEABLE_DICTIONARY)
  res.key = true
  res.icon = () => 'key12'
  return res;
}  

const READABLE = function(mustBeHeld) {
  const res = {}
  res.readable = true
  res.mustBeHeld = mustBeHeld
  res.icon = () => 'readable12'
  res.onCreation = function(o) {
    o.verbFunctions.push(function(o, verbList) {
      if (o.loc === game.player.name || !o.mustBeHeld) verbList.push(lang.verbs.read)
    })
  }
  return res;
}  



const FURNITURE = function(options) {
  const res = {
    testForPosture:(char, posture) => true,
    getoff:function(isMultiple, char) {
      if (!char.posture) {
        char.msg(lang.already, {item:char});
        return false;
      }
      if (char.posture) {
        char.msg(lang.stop_posture(char));  // stop_posture handles details
        return true;
      }  
    },
  }
  res.useDefaultsTo = function(char) {
    const cmd = this.useCmd ? this.useCmd : (this.reclineon ? 'ReclineOn' : (this.siton ? 'SitOn' : 'StandOn'))
    return char === game.player ? cmd : 'Npc' + cmd
  }

  res.assumePosture = function(isMultiple, char, posture, success_msg, adverb) {
    const tpParams = {char:char, item:this}
    if (char.posture === posture && char.postureFurniture === this.name) {
      char.msg(lang.already, {item:char});
      return false;
    }
    if (!this.testForPosture(char, posture)) {
      return false;
    }
    if (char.posture) {
      char.msg(stop_posture(char))
    }
    char.posture = posture;
    char.postureFurniture = this.name;
    char.postureAdverb = adverb === undefined ? 'on' : adverb;
    char.msg(success_msg, tpParams);
    if (typeof this["on" + posture] === "function") this["on" + posture](char);
    return true;
  };
  if (options.sit) {
    res.siton = function(isMultiple, char) {
      return this.assumePosture(isMultiple, char, "sitting", lang.sit_on_successful);
    };
  }
  if (options.stand) {
    res.standon = function(isMultiple, char) {
      return this.assumePosture(isMultiple, char, "standing", lang.stand_on_successful);
    };
  }
  if (options.recline) {
    res.reclineon = function(isMultiple, char) {
      return this.assumePosture(isMultiple, char, "reclining", lang.recline_on_successful);
    };
  }
  if (options.useCmd) {
    res.useCmd = options.useCmd
  }
  res.icon = () => 'furniture12'
  return res;
}

const SWITCHABLE = function(alreadyOn, nameModifier) {
  const res = {}
  res.switchedon = alreadyOn
  res.nameModifier = nameModifier
  
  res.onCreation = function(o) {
    o.verbFunctions.push(function(o, verbList) {
      if (!o.mustBeHeldToOperate || o.isAtLoc(game.player)) {
        verbList.push(o.switchedon ? lang.verbs.switchoff : lang.verbs.switchon)
      }
    })
    o.nameModifierFunctions.push(function(o, list) {
      if (o.nameModifier && o.switchedon) list.push(o.nameModifier)
    })
  }

  res.switchon = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    if (this.switchedon) {
      char.msg(prefix(this, isMultiple) + lang.already, {item:this});
      return false;
    }
    if (!this.checkCanSwitchOn()) {
      return false;
    }
    char.msg(lang.turn_on_successful, tpParams);
    this.doSwitchon();
    return true;
  };
  
  res.doSwitchon = function() {
    let lighting = game.dark;
    this.switchedon = true;
    game.update();
    if (lighting !== game.dark) {
      game.room.description();
    }
    if (this.onSwitchOn) this.onSwitchOn()
  };
  
  res.checkCanSwitchOn = () => true;
  
  res.switchoff = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    if (!this.switchedon) {
      char.msg(prefix(this, isMultiple) + lang.already, {item:this});
      return false;
    }
    char.msg(lang.turn_off_successful, tpParams);
    this.doSwitchoff();
    return true;
  };
  
  res.doSwitchoff = function() {
    let lighting = game.dark;
    this.switchedon = false;
    game.update();
    if (lighting !== game.dark) {
      game.room.description();
    }
    if (this.onSwitchOff) this.onSwitchOff()
  };

  res.icon = function() {
    return this.switchedon ? 'turnedon12' : 'turnedoff12'
  }

  return res;
};


// Ideally Quest will check components when doing a command for the whole
// I think?

const COMPONENT = function(nameOfWhole) {
  const res = {
    scenery:true,
    component:true,
    loc:nameOfWhole,
    takeable:true, // Set this as it has its own take attribute
    isAtLoc:function(loc, situation) {
      if (typeof loc !== "string") loc = loc.name
      if (situation !== world.PARSER) return false;
      let cont = w[this.loc];
      if (cont.isAtLoc(loc)) { return true; }
      return cont.isAtLoc(loc);
    },
    take:function(isMultiple, char) {
      msg(prefix(this, isMultiple) + lang.cannot_take_component, {char:char, item:this, whole:w[this.loc]});
      return false;
    },
  };
  if (!w[nameOfWhole]) debugmsg("Whole is not define: " + nameOfWhole);
  w[nameOfWhole].componentHolder = true;
  return res;
};


const EDIBLE = function(isLiquid) {
  const res = $.extend({}, TAKEABLE_DICTIONARY);
  res.isLiquid = isLiquid;
  res.eat = function(isMultiple, char) {
    const tpParam = {char:char, item:this}
    if (this.isLiquid) {
      msg(prefix(this, isMultiple) + lang.cannot_eat, tpParam);
      return false;
    }
    msg(prefix(this, isMultiple) + lang.eat_successful, tpParam);
    this.loc = null;
    if (this.onIngesting) this.onIngesting(char);
    return true;
  };
  res.drink = function(isMultiple, char) {
    const tpParam = {char:char, item:this}
    if (!this.isLiquid) {
      msg(prefix(this, isMultiple) + lang.cannot_drink, tpParam);
      return false;
    }
    msg(prefix(this, isMultiple) + lang.drink_successful, tpParam);
    this.loc = null;
    if (this.onIngesting) this.onIngesting(char);
    return true;
  };
  res.ingest = function(isMultiple, char) {
    if (this.isLiquid) {
      return this.drink(isMultiple, char)
    }
    else {
      return this.eat(isMultiple, char)
    }
  }
  res.icon = () => 'edible12'
  res.onCreation = function(o) {
    //console.log('edible: ' + o.name)
    o.verbFunctions.push(function(o, verbList) {
      verbList.push(o.isAtLoc(game.player.name) ? lang.verbs.drop : lang.verbs.take)
      if (o.isAtLoc(game.player)) verbList.push(o.isLiquid ? lang.verbs.drink : lang.verbs.eat)
    })
    //console.log(o.verbFunctions.length)
  }
  return res;
};


const VESSEL = function(capacity) {
  const res = {};
  res.vessel = true;
  res.containedLiquidName = false;
  res.volumeContained = 0;
  res.capacity = capacity;

  res.onCreation = function(o) {
    if (o.volumeContained && o.volumeContained > 0) {
      if (o.volumeContained >= o.capacity) {
        list.push("full of " + o.containedLiquidName)
      }
      else {
        list.push(o.volumeContained + " " + VOLUME_UNITS + " " + o.containedLiquidName)
      }
    }
  }

 
  res.fill = function(isMultiple, char, liquid) {
    const tpParams = {char:char, container:this}
    if (this.testRestrictions && !this.testRestrictions(liquid, char)) return false;
    const source = liquid.source(char)
    if (!source) return falsemsg(lang.none_here, {char:char, item:liquid});
    if (!this.mix && this.containedLiquidName !== liquid.name && this.volumeContained > 0) return falsemsg(lang.cannot_mix(char, this));
    if (this.volumeContained >= this.capacity) return falsemsg(prefix(this, isMultiple) + lang.already, {item:this});
    
    let volumeAdded = this.capacity - this.volumeContained;
    // limited volume available?
    if (source.getVolume) {
      const volumeAvailable = source.getVoume(liquid);
      if (volumeAvailable < volumeAdded) {
        volumeAdded = volumeAvailable;
      }
    }
    if (this.mix && liquid.name !== this.containedLiquidName !== liquid.name) {
      this.mix(liquid, volumeAdded)
    }
    else {
      this.volumeContained += volumeAdded;
      // Slight concerned that JavaScript using floats for everything means you could have a vessel 99.99% full, but that
      // does not behave as a full vessel, so if the vessel is pretty much full set the volume contained to the capacity
      if (this.volumeContained * 1.01 > this.capacity) this.volumeContained = this.capacity
      this.containedLiquidName = liquid.name;
      msg(prefix(this, isMultiple) + lang.fill_successful, tpParams)
    }
    return true;
  };

  res.empty = function(isMultiple, char) {
    const tpParams = {char:char, container:this}
    if (this.volumeContained >= this.capacity) {
      msg(prefix(this, isMultiple) + lang.already, {item:this});
      return false;
    }
    // check if liquid available
    msg(prefix(this, isMultiple) + lang.empty_successful, tpParams);
    return true;
  };

  return res;
}

// If locs changes, that changes are not saved!!!

// A room or item can be a source of one liquid by giving it a "isSourceOf" function:
// room.isSourceOf("water")
// 

const LIQUID = function(locs) {
  const res = EDIBLE(true);
  res.liquid = true;
  res.pronouns = lang.pronouns.massnoun;
  res.pluralAlias = '*';
  res.drink = function(isMultiple, char, options) {
    msg(prefix(this, isMultiple) + "drink: " + options.verb + " char: " + char.name);
  };
  res.sourcedAtLoc = function(loc) { 
    if (typeof loc !== "string") loc = loc.name;
    return w[loc].isSourceOf(this.name);
  }
  res.source = function(chr) { 
    if (chr === undefined) chr = game.player;
    // Is character a source?
    if (chr.isSourceOf && chr.isSourceOf(this.name)) return chr;
    // Is the room a source?
    if (w[chr.loc].isSourceOf && w[chr.loc].isSourceOf(this.name)) return w[chr.loc];
    const items = scopeHeldBy(chr).concat(scopeHeldBy(chr.loc));
    for (let obj of items) {
      if (obj.isSourceOf && obj.isSourceOf(this.name)) return obj;
    }
    return false;
  }
  res.isAtLoc = function(loc) { return false; }
  return res;
}


const ROPE = function(tetheredTo) {
  const res = $.extend({
    rope:true,
    tethered:(tetheredTo !== undefined),
    tiedTo1:tetheredTo,
    locs:[],
    attachVerb:lang.ropeAttachVerb,
    attachedVerb:lang.ropeAttachedVerb,
    detachVerb:lang.ropeDetachVerb,
    isAtLoc:function(loc, situation) {
      if (this.loc) {
        this.locs = [this.loc]
        delete this.loc
      }
      if (typeof loc !== "string") loc = loc.name
      // If the rope is in the location and held by the character, only want it to appear once in the side pane
      if (situation === world.SIDE_PANE && this.locs.includes(game.player.name) && loc !== game.player.name) return false
      return this.locs.includes(loc) 
    },
    isAttachedTo:function(item) {
      return this.tiedTo1 === item.name || this.tiedTo2 === item.name
    },
    getUnattached:function() {
      let res = this.tiedTo1 ? [this.tiedTo1] : []
      if (this.tiedTo2) res.push(this.tiedTo2)
      return res
    },
    
    examineAddendum:function() {
      // It is tied to the chair, and trails into the kitchen.
      
      // What is it tied to (and we can see)
      const obj1 = (this.tiedTo1 && w[this.tiedTo1].isHere()) ? w[this.tiedTo1] : false
      const obj2 = (this.tiedTo2 && w[this.tiedTo2].isHere()) ? w[this.tiedTo2] : false

      // Handle the easy cases, only one loc in locs
      if (this.locs.length === 1) {
        if (obj1 && obj2) return processText(lang.examineAddBothEnds, {rope:this, obj1:obj1, obj2:obj2})
        if (obj1) return processText(lang.ropeExamineAddOneEnd, {rope:this, obj1:obj1})
        if (obj2) return processText(lang.ropeExamineAddOneEnd, {rope:this, obj1:obj2})
        return ''  // just in one place, like any ordinary object
      }

      // Who is it held by (and we can see)
      const end1 = w[this.locs[0]]
      const holder1 = (end1.npc || end1.player) && end1.isHere() ? end1 : false
      const end2 = w[this.locs[this.locs.length - 1]]
      const holder2 = (end2.npc || end2.player) && end2.isHere() ? end2 : false
      
      // What locations does it go to
      const index = this.locs.findIndex(el => el === game.player.loc)
      const loc1 = (index > 0 && w[this.locs[index - 1]].room) ? w[this.locs[index - 1]] : false
      const loc2 = (index < (this.locs.length - 1) && w[this.locs[index + 1]].room) ? w[this.locs[index + 1]] : false
      
      let s = ''
      let flag = false
      if (obj1 || holder1 || loc1) {
        s += ' ' + lang.ropeOneEnd + ' '
        flag = true
      }
      if (obj1) {
        s += lang.ropeExamineEndAttached.replace('obj', 'obj1')
      }
      else if (holder1) {
        s += lang.ropeExamineEndHeld.replace('holder', 'holder1')
      }
      else if (loc1) {
        s += lang.ropeExamineEndHeaded.replace('loc', 'loc1')
      }
      
      if (obj2 || holder2 || loc2) {
        s += ' ' + (flag ? lang.ropeOtherEnd : lang.ropeOneEnd) + ' '
        flag = true
      }
      if (obj2) {
        s += lang.ropeExamineEndAttached.replace('obj', 'obj2')
      }
      else if (holder2) {
        s += lang.ropeExamineEndHeld.replace('holder', 'holder2')
      }
      else if (loc2) {
        s += lang.ropeExamineEndHeaded.replace('loc', 'loc2')
      }
      
      return processText(s, {rope:this, obj1:obj1, obj2:obj2, holder1:holder1, holder2:holder2, loc1:loc1, loc2:loc2})
    },
    canAttachTo:function(item) {
      return item.attachable
    },
    attachTo:function(item) {
      const loc = item.loc // may want to go deep in case tied to a component of an item !!!
      if (!this.tiedTo1) {
        if (this.locs.length > 1) this.locs.shift()
        if (this.locs[0] !== loc) this.locs.unshift(loc)
        this.tiedTo1 = item.name
      }
      else {
        if (this.locs.length > 1) this.locs.pop()
        if (this.locs[this.locs.length - 1] !== loc) this.locs.push(loc)
        this.tiedTo2 = item.name
      }
      if (this.onTie) this.onTie(item)
    },
    useWith:function(char, item) {
      return handleTieTo(char, this, item) === world.SUCCESS
    },
    detachFrom:function(item) {
      if (this.tiedTo1 === item.name) {
        if (this.locs.length === 2 && this.locs.includes(game.player.name)) this.locs.shift() // remove this room
        if (this.locs[0] !== game.player.name) {
          this.locs.unshift(game.player.name)
        }
        delete this.tiedTo1
      }
      else {
        if (this.locs.length === 2 && this.locs.includes(game.player.name)) this.locs.pop() // remove this room
        if (this.locs[this.locs.length - 1] !== game.player.name) this.locs.push(game.player.name)
        delete this.tiedTo2
      }
      if (this.onUntie) this.onUntie(item)
    },  
  
  }, TAKEABLE_DICTIONARY)
  
  // This MUST be sent the fromLoc unless if is only in a single location, and you must already have established it is not attached
  // once this is registered for onGoX it stays registered, even when dropped - it is much easier!
  res.moveToFrom = function(toLoc, fromLoc) {
    if (fromLoc === undefined) {
      if (this.locs.length !== 1) throw "Need a fromLoc here for a rope object"
      fromLoc = this.locs[0]
    }
    if (fromLoc === toLoc) return
    if (!w[fromLoc]) errormsg("The location name `" + fromLoc + "`, does not match anything in the game.")
    if (!w[toLoc]) errormsg("The location name `" + toLoc + "`, does not match anything in the game.")
      
    let end
    if (this.locs.length === 1) {
      this.locs = [toLoc]
      end = 0
    }
    else if (this.locs[0] === fromLoc) {
      this.locs.shift()
      this.locs.unshift(toLoc)
      end = 1
    }
    else if (this.locs[this.locs.length - 1] === fromLoc) {
      this.locs.pop()
      this.locs.push(toLoc)
      end = 2
    }
    if (w[toLoc].onGoCheckList && !w[toLoc].onGoCheckList.includes(this.name)) w[toLoc].onGoCheckList.push(this.name)
    if (w[toLoc].onGoActionList && !w[toLoc].onGoActionList.includes(this.name)) w[toLoc].onGoActionList.push(this.name)
    w[fromLoc].itemTaken(this, end);
    w[toLoc].itemDropped(this, end);
    if (this.onMove !== undefined) this.onMove(toLoc, fromLoc, end)
  }

  res.takeFromLoc = function(char) {
    if (this.locs.includes(char.loc)) return char.loc
    if (this.locs.length === 1) return this.locs[0]
    throw "Sorry, taking ropes from containers has yet to be fully implemented"
  }

/*  res.drop = function(isMultiple, char) {
    msg(prefix(this, isMultiple) + lang.drop_successful(char, this));
    //this.moveToFrom(char.loc);
    if (this.tiedTo1 === char.name) this.tiedTo1 = char.loc
    if (this.tiedTo2 === char.name) this.tiedTo2 = char.loc
    w[char.name].itemTaken(this);
    w[char.loc].itemDropped(this);
    if (this.onMove !== undefined) this.onMove(char.loc, char.name)  // may want to say which end
    return true;
  }*/
  
  res.take = function(isMultiple, char) {
    const tpParams = {char:char, item:this}
    if (this.isAtLoc(char.name)) return falsemsg(prefix(this, isMultiple) + lang.already_have, tpParams)
    if (!char.canManipulate(this, "take")) return false;
    if (this.tiedTo1 && this.tiedTo2) return falsemsg(prefix(this, isMultiple) + "It is tied up at both ends.")
    msg(prefix(this, isMultiple) + lang.take_successful, tpParams);
    this.moveToFrom(char.name, char.loc) // !!! assuming where it is going from
    if (this.scenery) delete this.scenery;
    return true;
  }
  
  res.onGoCheck = function(char, dest) {
    if (this.ropeLength === undefined)  // length not set, infinitely long!
    if (this.locs.length < 3) return true // just in one room
    if (!this.locs.includes(char.name)) return true // not carrying, so no issue
    if (this.locs[0] === char.name) {
      if (this.locs[2] === dest) return true // heading back where we came from
    }
    else {
      if (this.locs[this.locs.length - 3] === dest) return true // heading back where we came from
    }        
    if (this.locs.length <= this.ropeLength) return true
    msg("{nv:rope:be:true} not long enough, you cannot go any further.", {rope:this})
    return false
  }
  res.onGoAction = function(char) {
    if (this.locs.length === 1) return // carried as single item, treat as std item
    if (!this.locs.includes(char.name)) return // not carrying, so no issue
    if (this.locs[0] === char.name) {
      // suppose locs is me, lounge, kitchen, garden
      // case 1: move lounge to kitchen -> me, kitchen, garden
      // case 2: move lounge to hall -> me, hall, lounge, kitchen, garden
      this.locs.shift()  // remove me
      if (this.locs[1] === char.loc) {
        this.locs.shift()
      }
      else {
        this.locs.unshift(char.loc)
      }
      this.locs.unshift(char.name)
    }
    else {
      this.locs.pop()  // remove me
      if (this.locs[this.locs.length - 2] === char.loc) {
        this.locs.pop()
      }
      else {
        this.locs.push(char.loc)
      }
      this.locs.push(char.name)
    }        
  }
  return res
}


const TRANSIT_BUTTON = function(nameOfTransit) {
  const res = {
    loc:nameOfTransit,
    transitButton:true,
    
    onCreation:function(o) {
      //console.log('button: ' + o.name)
      o.verbFunctions.push(function(o, verbList) {
        verbList.push(lang.verbs.push)
      })
      //console.log(o.verbFunctions.length)
    },

    isAtLoc:function(loc, situation) {
      if (situation === world.LOOK) return false;
      if (typeof loc !== "string") loc = loc.name
      return (this.loc === loc)
    },


    push:function() {
      const transit = w[this.loc];

      if (typeof transit.transitCheck === "function" && !transit.transitCheck()) {
        if (transit.transitAutoMove) world.setRoom(game.player, game.player.previousLoc, transit.transitDoorDir)
        return false;
      }

      const exit = transit[transit.transitDoorDir];
      if (this.locked) {
        printOrRun(game.player, this, "transitLocked");
        return false;
      }
      else if (exit.name === this.transitDest) {
        printOrRun(game.player, this, "transitAlreadyHere");
        return false;
      }
      else {
        printOrRun(game.player, this, "transitGoToDest")
        transit.update(this, true)
      }
    },
  };
  return res;
};


// This is for rooms
const TRANSIT = function(exitDir) {
  const res = {
    saveExitDests:true,
    transitDoorDir:exitDir,
    mapMoveableLoc:true,
    mapRedrawEveryTurn:true,

    beforeEnter:function() {
      this.update(game.player.previousLoc)
    },

    getTransitButtons:function(includeHidden, includeLocked) {
      return this.getContents(world.LOOK).filter(function(el) {
        if (!el.transitButton) return false;
        if (!includeHidden && el.hidden) return false;
        if (!includeLocked && el.locked) return false;
        return true;
      })
    },
    
    findTransitButton:function(dest) {
      for (let key in w) {
        if (w[key].loc === this.name && w[key].transitDest === dest) return w[key]
      }
      return null
    },

    update:function(transitButton, callEvent) {
      if (typeof transitButton === 'string') transitButton = this.findTransitButton(transitButton)
      
      const exit = this[this.transitDoorDir]
      const previousDest = exit.name
      exit.name = transitButton.transitDest
      this.currentButtonName = transitButton.name
      
      if (typeof map !== 'undefined') {
        console.log("MAPPING")
        console.log(transitButton.transitDest)
        
        this.mapCurrentConnection = this.locations.findIndex(el => el.connectedRoom.name === transitButton.transitDest)
        if (this.mapCurrentConnection === -1) {
          errormsg('Failed to find a location called "' + transitButton.transitDest + '"')
          console.log(this.locations)
          return
        }
        console.log(this.mapCurrentConnection)
        const loc = this.locations[this.mapCurrentConnection]
        console.log(loc)
        
        // set these so we can get the player location
        this.mapX = loc.mapX
        this.mapY = loc.mapY
        this.mapZ = loc.mapZ
        this.mapRegion = loc.mapRegion
      }
      if (callEvent && this.transitOnMove) this.transitOnMove(transitButton.transitDest, previousDest)
    },
  
    // The exit is not saved, so after a load, need to update the exit
    templatePostLoad:function() {
      if (this.currentButtonName) {
        const exit = this[this.transitDoorDir]
        exit.name = this.currentButtonName.transitDest
      }
      if (this.postLoad) this.postLoad()
    },
  
    transitOfferMenu:function() {
      if (typeof this.transitCheck === "function" && !this.transitCheck()) {
        if (this.transitAutoMove) world.setRoom(game.player, game.player.previousLoc, this.transitDoorDir)
        return false;
      }
      const buttons = this.getTransitButtons(true, false);
      const transitDoorDir = this.transitDoorDir;
      const room = this;
      showMenu(this.transitMenuPrompt, buttons.map(el => el.transitDestAlias), function(result) {
        for (let button of buttons) {
          if (buttons[i].transitDestAlias === result) {
            if (room[transitDoorDir].name === button.transitDest) {
              printOrRun(game.player, button, "transitAlreadyHere");
            }
            else {
              printOrRun(game.player, button, "transitGoToDest")
              transit.update(button.transitDest, true)
            }
            
            room[transitDoorDir].name = button.transitDest
            if (room.transitAutoMove) world.setRoom(game.player, button.transitDest, room[transitDoorDir])
          }
        }
      })
    },
  }
  
  return res;
}



const CHARACTER = function() {
  const res = {
    // The following are used also both player and NPCs, so we can use the same functions for both
    canReachThrough:() => true,
    canSeeThrough:() => true,
    getAgreement:() => true,
    getContents:util.getContents,
    pause:NULL_FUNC,  
    canManipulate:() => true,
    canMove:() => true,
    canPosture:() => true,
    canTakeDrop:() => true,
    mentionedTopics:[],
    canTalkFlag:true,
    canTalk:function() { return this.canTalkFlag },
    onGoCheckList:[],
    onGoActionList:[],
    followers:[],
    
    getHolding:function() {
      return this.getContents(world.LOOK).filter(function(el) { return !el.getWorn(); });
    },
    
    getWearing:function() {
      return this.getContents(world.LOOK).filter(function(el) { return el.getWorn() && !el.ensemble; });
    },
  
    getStatusDesc:function() {
      if (!this.posture) return false;
      return this.posture + " " + this.postureAdverb + " " + lang.getName(w[this.postureFurniture], {article:DEFINITE});
    },
    
    isAtLoc:function(loc, situation) {
      if (situation === world.LOOK) return false;
      if (situation === world.SIDE_PANE) return false;
      if (typeof loc !== "string") loc = loc.name
      return (this.loc === loc);
    },

    getOuterWearable:function(slot) {
      const clothing = this.getWearing().filter(function(el) {
        if (typeof el.getSlots !== "function") {
          console.log("Item with worn set to true, but no getSlots function");
          console.log(el);
        }
        return el.getSlots().includes(slot);
      });

      if (clothing.length === 0) { return false; }
      let outer = clothing[0];
      for (let garment of clothing) {
        if (garment.wear_layer > outer.wear_layer) {
          outer = garment;
        }
      }
      return outer;
    },

    // Also used by NPCs, so has to allow for that
    msg:function(s, params) {
      msg(s, params);
    },
    
    onCreation:function(o) {
      o.nameModifierFunctions.push(function(o, l) {
        let s = ''
        const state = o.getStatusDesc();
        const held = o.getHolding();
        const worn = o.getWearingVisible();

        const list = [];
        if (state) {
          list.push(state);
        }
        if (held.length > 0) {
          list.push(lang.invHoldingPrefix + ' ' + formatList(held, {article:INDEFINITE, lastJoiner:lang.list_and, modified:false, nothing:lang.list_nothing, loc:o.name, npc:true}));
        }
        if (worn.length > 0) {
          list.push(lang.invWearingPrefix + ' ' + formatList(worn, {article:INDEFINITE, lastJoiner:lang.list_and, modified:false, nothing:lang.list_nothing, loc:o.name, npc:true}));
        }
        if (list.length > 0) l.push(list.join('; '))
      })
      o.verbFunctions.push(function(o, verbList) {
        verbList.shift()
        verbList.push(lang.verbs.lookat)
        if (!settings.noTalkTo) verbList.push(lang.verbs.talkto)
      })
    },

  }
  return res
}




const PLAYER = function() {
  const res = CHARACTER()
  res.pronouns = lang.pronouns.secondperson
  res.player = true
  return res;
}


