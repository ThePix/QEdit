'use strict'

/*
Assumptions:
variables, attribute names and object names do not include spaces
if statements always multiline

need to prefix objects with w.
need to declare locals


*/



const jsReplacements = [
  {asl:'\r', js:''},
  {asl:/HasString\(([a-zA-Z_]+), \^y\)/g, js:'typeof $1.^n === "string"'},
  {asl:/HasInt\(([a-zA-Z_]+), \^y\)/g, js:'typeof $1.^n === "numeric"'},
  {asl:/HasBoolean\(([a-zA-Z_]+), \^y\)/g, js:'typeof $1.^n === "boolean"'},
  {asl:/HasScript\(([a-zA-Z_]+), \^y\)/g, js:'typeof $1.^n === "function"'},
  {asl:/GetBoolean\(([a-zA-Z_]+), \^y\)/g, js:'$1.^n'},
  {asl:/ and /g, js:' && '},
  {asl:/ or /g, js:' || '},
  {asl:/\bnot /g, js:'!'},
  {asl:/ \<\> /g, js:' !== '},
  {asl:/do ?\(([a-zA-Z_]+), \^y\)/g, js:'$1.^n()'},
  
  {asl:/if \(([a-zA-Z_]+)\.parent = ([a-zA-Z_]+)\)/g, js:'if ($1.isAtLoc("$2"))'},
  
  {asl:/([a-zA-Z_.]+) = \1 \+ /g, js:'$1 += '},
  {asl:/([a-zA-Z_.]+) = \1 \- /g, js:'$1 -= '},
  
  //list add(game.forgetme, this)
  
  
  {asl:/GetDisplayAlias ?\(([a-zA-Z_.]+)\)/g, js:'$1.byname({})'},
  {asl:/([a-zA-Z_]+)\.alias/g, js:'$1.byname({})'},

  {asl:/CapFirst/g, js:'sentenceCase'},

]


class Translator {
  static aslToJs(asl) {
    const lines = []
    for (let s of asl.split('\n')) {
      console.log(s)
      console.log(s.length)
      s = s.replace(/\\\"/g, '~~~~quote~~~~')
      s = s.replace(/\^/g, '~~~~hat~~~~')
      console.log(s)

      const ary1 = s.match(/"(.*?)"/g)
      s = s.replace(/"(.*?)"/g, '^y')
      console.log(s)
      for (let d of jsReplacements) {
        //console.log(d.asl)
        //console.log(s.match(d.asl))
        s = s.replace(d.asl, d.js)
        //console.log(s)
      }
      if (ary1) {
        console.log('--------------------')
        console.log(ary1)
        console.log(ary1.length)
        console.log(s)
        for (let s1 of ary1) {
          const md = s.match(/\^[yn]/)
          console.log(md)
          if (md[0] === '^y') {
            s = s.replace('^y', s1)
          }
          else {
            s = s.replace('^n', s1.replace(/\"/g, ''))
          }
        }
      }
      if (s.match(/^ +if/)) {
        s = s.replace(/\b=\b/, '===')
        // Also not at some point
      }
      console.log(s)

      
      s = s.replace(/~~~~quote~~~~/g, '\\"')
      s = s.replace(/~~~~hat~~~~/g, '^')
      lines.push(s)
    }
    
    return lines
  }
}









module.exports = [Translator]
