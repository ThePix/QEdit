const [ASL2JS] = require('../src/translator/asl2js.js')

const out = function(lines) {
  for (s of lines) console.log(s)
}


  const asl = `
      if (not this.dead) {
        // secondary attack does not depend on strength, etc. or transient bonuses
        attackroll = GetRandomInt (1, 20) - this.defence + game.pov.secondary_attack.attackbonus
        //game.pov.currectattack = game.pov.equipped

        if (this.noncorporeal and GetElement(game.pov.equipped) = null) {
          if (game.pov.secondary_attack.nonweapon) {
            msg("You attack the " + GetDisplayAlias(this) + ", and pass straight through it!")
          }
          else {
            msg("You swing your " + GetDisplayAlias(game.pov.secondary_attack) + " and it goes straight through the " + GetDisplayAlias(this) + "!")
          }
        }
        else if (attackroll > 10) {
          damage = GetDamage (game.pov.secondary_attack, 0, this)
          this.hitpoints = this.hitpoints - damage
          if (this.hitpoints > 0) {
            if (game.pov.secondary_attack.nonweapon) {
              msg ("You attack and hit, doing " + damage + " points of damage (" + this.hitpoints + " hits left). " + this.hurtbyweapon)
            }
            else {
              msg (this.temp_desc + " " + GetDisplayAlias(game.pov.secondary_attack) + " and hit, doing " + damage + " points of damage (" + this.hitpoints + " hits left). " + this.hurtbyweapon)
            }
            if (HasScript(this, "onweaponhit")) do (this, "onweaponhit")
          }
          else {
            if (game.pov.secondary_attack.nonweapon) {
              msg ("You attack and hit, doing " + damage + " points of damage. " + this.death)
            }
            else {
              msg (this.temp_desc + " " + GetDisplayAlias(game.pov.secondary_attack) + " and hit, doing " + damage + " points of damage. " + this.death)
            }
            do (this, "makedead")
          }
        }
        else {
          if (game.pov.secondary_attack.nonweapon) {
            msg ("You attack and miss.")
          }
          else {
            msg ("You swing your " + GetDisplayAlias(game.pov.secondary_attack) + " and miss.")
          }
        }
      }`

//const asl = 'this.listalias = "<span style=\"color:#800000;font-weight:bold;\">" + s + "</span>"'
//const asl = 'style=\\"color'
//console.log(asl)
//console.log(asl.length)

out(ASL2JS.aslToJs(asl))
