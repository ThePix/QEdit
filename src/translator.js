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
  {asl:/HasInt\(([a-zA-Z_]+), \^y\)/g, js:'typeof $1.^n === "number"'},
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

  {asl:/ToInt (([0-9a-zA-Z_."]+))/g, js:'parseInt($)'}
  {asl:/TypeOf (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'typeof $[$]'}
  {asl:/TypeOf (([0-9a-zA-Z_."]+))/g, js:'typeof $'}
  {asl:/ClearScreen ()/g, js:'clearScreen()'}
  {asl:/DisplayList (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'msgList($, $)'}
  {asl:/msg (([0-9a-zA-Z_."]+))/g, js:'msg($)'}
  {asl:/picture (([0-9a-zA-Z_."]+))/g, js:'picture($)'}
  {asl:/List add (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.push($)/g, js:''}
  {asl:/List remove (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'arrayRemove($, $)'}
  {asl:/FilterByAttribute (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.filter(el => el[$] === $)'}
  {asl:/FilterByNotAttribute (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.filter(el => el[$] !== $)'}
  {asl:/IndexOf (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.indexOf($)'}
  {asl:/([0-9a-zA-Z_."]+) = ListCombine (list1, list2)/g, js:'$ = list1.concat(list2)'}
  {asl:/ListContains(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.includes($)'}
  {asl:/ListCompact/g, js:'[...new Set(array)]'}
  {asl:/ListCount(([0-9a-zA-Z_."]+))/g, js:'$.length'}
  {asl:/ListExclude list1, list2)/g, js:'arraySubtract(list1, list2)'}
  {asl:/ListItem ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/([0-9a-zA-Z_."]+) = NewList ()/g, js:'const $ = []'}
  {asl:/([0-9a-zA-Z_."]+) = NewObjectList ()/g, js:'const $ = []'}
  {asl:/([0-9a-zA-Z_."]+) = NewStringList ()/g, js:'const $ = []'}
  {asl:/([0-9a-zA-Z_."]+) = ObjectListCompact ()/g, js:'[...new Set(array)]'}
  {asl:/ObjectListItem (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/StringListItem(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/StringListSort(([0-9a-zA-Z_."]+))/g, js:'$.sort()'}
  {asl:/Dictionary add(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$] = $'}
  {asl:/Dictionary remove(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'delete $[$]'}
  {asl:/DictionaryAdd(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$] = $'}
  {asl:/DictionaryContains(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.includes($)'}
  {asl:/DictionaryCount(([0-9a-zA-Z_."]+))/g, js:'Object.keys($).length'}
  {asl:/DictionaryItem(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/DictionaryRemove(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'delete $[$]'}
  {asl:/([0-9a-zA-Z_."]+) = NewDictionary ()/g, js:'const $ = {}'}
  {asl:/([0-9a-zA-Z_."]+) = NewObjectDictionary ()/g, js:'const $ = {}'}
  {asl:/([0-9a-zA-Z_."]+) = NewScriptDictionary ()/g, js:'const $ = {}'}
  {asl:/([0-9a-zA-Z_."]+) = NewStringDictionary ()/g, js:'const $ = {}'}
  {asl:/([0-9a-zA-Z_."]+) = ObjectDictionaryItem (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$ = $[$]'}
  {asl:/([0-9a-zA-Z_."]+) = QuickParams (([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'const $ = {$:$}'}
  {asl:/ScriptDictionaryItem(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/StringDictionaryItem(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$[$]'}
  {asl:/CapFirst(([0-9a-zA-Z_."]+))/g, js:'sentenceCase($)'}
  {asl:/Conjugate(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'conjugate($, $)'}
  {asl:/DisplayMoney(([0-9a-zA-Z_."]+))/g, js:'displayMoney($)'}
  {asl:/DisplayNumber(([0-9a-zA-Z_."]+))/g, js:'displayNumber($)'}
  {asl:/EndsWith(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.endsWith($)'}
  {asl:/FormatList(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'formatList($, {sep:$, lastJoiner:$, nothing:$})'}
  {asl:/Instr(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.indexOf($)'}
  {asl:/InstrRev(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.lastIndexOf($)'}
  {asl:/IsNumeric(([0-9a-zA-Z_."]+))/g, js:'!Number.isNaN($)'}
  {asl:/IsRegexMatch(([0-9a-zA-Z_."]+), regex)/g, js:'$.match(regex)'}
  {asl:/Join(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.join($)'}
  {asl:/LCase(([0-9a-zA-Z_."]+))/g, js:'$.toLowerCase()'}
  {asl:/LengthOf(([0-9a-zA-Z_."]+))/g, js:'$.length'}
  {asl:/Mid(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.substr($)'}
  {asl:/Mid(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.substr($, $)'}
  {asl:/PadString(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.padString($)'}
  {asl:/ProcessText(([0-9a-zA-Z_."]+))/g, js:'processText($)'}
  {asl:/Replace(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.replace($, $)'}
  {asl:/Spaces(([0-9a-zA-Z_."]+))/g, js:'spaces($)'}
  {asl:/Split(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.split($)'}
  {asl:/StartsWith(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'$.startsWith($)'}
  {asl:/ToRoman(([0-9a-zA-Z_."]+))/g, js:'toRoman($)'}
  {asl:/ToWords(([0-9a-zA-Z_."]+))/g, js:'toWords($)'}
  {asl:/Trim(([0-9a-zA-Z_."]+))/g, js:'$.trim()'}
  {asl:/UCase(([0-9a-zA-Z_."]+))/g, js:'$.toUpperCase()'}
  {asl:/WriteVerb(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'nounVerb($, $)'}
  {asl:/DiceRoll(([0-9a-zA-Z_."]+))/g, js:'diceRoll($)'}
  {asl:/GetRandomInt(([0-9a-zA-Z_."]+), ([0-9a-zA-Z_."]+))/g, js:'randomInt($, $)'}
  {asl:/PickOneObject(([0-9a-zA-Z_."]+))/g, js:'randomFromArray($)'}
  {asl:/PickOneString(([0-9a-zA-Z_."]+))/g, js:'randomFromArray($)'}
  {asl:/RandomChance(([0-9a-zA-Z_."]+))/g, js:'randomChance($)'}
  {asl:/OutputText(([0-9a-zA-Z_."]+))/g, js:'msg($)'}
  {asl:/OutputTextNoBr(([0-9a-zA-Z_."]+))/g, js:'msg($)'}
  {asl:/OutputTextRaw(([0-9a-zA-Z_."]+))/g, js:'msg($)'}
  {asl:/OutputTextRawNoBr(([0-9a-zA-Z_."]+))/g, js:'msg($)

  {asl:/Set(Alignment|BackgroundColour|BackgroundImage|BackgroundOpacity|FontName|FontSize|ForegroundColour|WebFontName)(.*)/g, js:'// Set$1$2'},
  {asl:/TextFX_Typewriter\(([a-zA-Z_."]+), ([a-zA-Z_."]+)\)/g, js:'msg($1)  // Was Typewriter, time=$2'}, 
  {asl:/TextFX_Unscramble\(([a-zA-Z_."]+), ([a-zA-Z_."]+), ([a-zA-Z_."]+)\)/g, js:'msg($1)  // Was Unscramble, time=$2, reveal=$3'}, 


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
