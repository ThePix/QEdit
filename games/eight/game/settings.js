undefined


settings.inventories = [
  {name:'Items Held', alt:'itemsHeld', test:settings.isHeldNotWorn, getLoc:function() { return game.player.name; } },
  {name:'Items Worn', alt:'itemsWorn', test:settings.isWorn, getLoc:function() { return game.player.name; } },
  {name:'Items Here', alt:'itemsHere', test:settings.isHere, getLoc:function() { return game.player.loc; } },
]
settings.status = [
]
settings.template = [
  '{b:{cap:{hereName}}} {objectsHere:You can see {objects} here.} {exitsHere:You can go {exits}.} {terse:{hereDesc}} ',
]
settings.title = "eight"
settings.subtitle = ""
settings.author = "kv"
settings.version = "1.0"
settings.thank = []
settings.lang = "lang-en"
settings.debug = false
settings.moneyFormat = "$!"
settings.givePlayerSayMsg = true
settings.noAskTell = "You cannot use ASK/TELL ABOUT in this game."
settings.dropdownForConv = false
settings.npcReactionsAlways = false
settings.intro = ""
settings.setup = ""
settings.textInput = true
settings.cursor = ">"
settings.cmdEcho = true
settings.textEffectDelay = 50
settings.clearScreenOnRoomEnter = false
settings.panes = "Left"
settings.compass = true
settings.statusPane = ""
settings.statusWidthLeft = 120
settings.statusWidthRight = 40
settings.divider = false
