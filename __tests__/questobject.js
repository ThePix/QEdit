'use strict';

// I am unable to do tests involving XML as DOMParser is not accessible.
// I am not sure why it can be used in Electron/React but not in tests.
// I have looked somewhat at other XML translators without success;
// also tried "dom-parser" but it uses different names (no Element class),
// so I still get errors. 


const [QuestObject, Exit, xmlToDict] = require('../src/questobject')




test('xmlToDict', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('  <object name="test_object" count="5">\n    <width>Ten</width>\n  </object>\n\n', "text/xml")
  const d = xmlToDict(xmlDoc.documentElement)
  expect(d.name).toBe("test_object")
  expect(d.count).toBe("5")
  expect(d.width).toBe("Ten")
});



test('xmlToDict with settings', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('  <object name="test_object" count="5">\n    <width>Ten</width>\n  </object>\n\n', "text/xml")
  const d = xmlToDict(xmlDoc.documentElement, {height:14})
  expect(d.name).toBe("test_object")
  expect(d.count).toBe("5")
  expect(d.width).toBe("Ten")
  expect(d.height).toBe(14)
});

test('xmlToDict with script', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('<testAtt type="script">\n            <code><![CDATA[msg("Hello")]]></code>\n          </testAtt>', "text/xml")
  const d = xmlToDict(xmlDoc.documentElement)
  expect(d.type).toBe("script")
  expect(d.code).toBe("msg(\"Hello\")")
});




// Also want to cope with Quest 5 exits!!!!

test('Exit.createFromXml simple', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('<exit alias="north" to="library">\n    </exit>', "text/xml")
  const d = Exit.createFromXml(xmlDoc.documentElement)
  expect(d.data.useType).toBe("default")
  expect(d.name).toBe("library")
});

test('Exit.createFromXml msg', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('<exit alias="north" to="library">\n      <useType>msg</useType>\n      <msg><![CDATA[You go into the library.]]></msg>\n    </exit>', "text/xml")
  const d = Exit.createFromXml(xmlDoc.documentElement)
  expect(d.data.useType).toBe("msg")
  expect(d.data.msg).toBe("You go into the library.")
});

test('Exit.createFromXml function', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('<exit alias="east" to="library">\n      <useType>custom</useType>\n      <use><![CDATA[msg("You go into the library.")]]></use>\n    </exit>', "text/xml")
  const d = Exit.createFromXml(xmlDoc.documentElement)
  expect(d.data.useType).toBe("custom")
  expect(d.data.use).toBe('msg("You go into the library.")')
});

test('Exit.createFromXml simple Quest5', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('      <exit alias="east" to="landing">\n        <inherit name="eastdirection" />\n      </exit>', "text/xml")
  const d = Exit.createFromXml(xmlDoc.documentElement)
  expect(d.data.useType).toBe("default")
  expect(d.name).toBe("landing")
});

test('Exit.createFromXml invisible Quest5', () => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString('      <exit name="exit_cellars_secret_passage" alias="east" to="secondcrypt">\n        <inherit name="eastdirection" />\n       <visible type="boolean">false</visible>\n      </exit>', "text/xml")
  const d = Exit.createFromXml(xmlDoc.documentElement)
  expect(d.data.useType).toBe("default")
  expect(d.data.visible).toBe(false)
  expect(d.name).toBe("secondcrypt")
});



      






const createFromXml = function(xml) {
  const parser = new DOMParser()
  // This is a Document object, not XMLDocument
  const xmlDoc = parser.parseFromString(xml, "text/xml")
  return new QuestObject(xmlDoc.documentElement, 600)
}








test('toXml 1', () => {
  const obj = new QuestObject({name:'test_object'})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});



test('toJs 1', () => {
  const obj = new QuestObject({name:'test_object'})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n})'
  expect(result).toBe(expected);
});



test('toXml with template', () => {
  const obj = new QuestObject({name:'test_object', jsMobilityType:"Takeable", jsIsSwitchable:true})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <jsMobilityType type="string"><![CDATA[Takeable]]></jsMobilityType>\n    <jsIsSwitchable type="boolean">true</jsIsSwitchable>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with template', () => {
  const obj = new QuestObject({name:'test_object', jsMobilityType:"Takeable", jsIsSwitchable:true})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", TAKEABLE(), SWITCHABLE(), {\n})'
  expect(result).toBe(expected);
});



test('toXml with string', () => {
  const obj = new QuestObject({name:'test_object', testAtt:"Testable", second:""})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="string"><![CDATA[Testable]]></testAtt>\n    <second type="string"><![CDATA[]]></second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with string', () => {
  const obj = new QuestObject({name:'test_object', testAtt:"Testable", second:""})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:"Testable",\n  second:"",\n})'
  expect(result).toBe(expected);
});



test('toXml with boolean', () => {
  const obj = new QuestObject({name:'test_object', testAtt:true, second:false})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="boolean">true</testAtt>\n    <second type="boolean">false</second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with boolean', () => {
  const obj = new QuestObject({name:'test_object', testAtt:true, second:false})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:true,\n  second:false,\n})'
  expect(result).toBe(expected);
});



test('toXml with number', () => {
  const obj = new QuestObject({name:'test_object', testAtt:12, second:-5})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="int">12</testAtt>\n    <second type="int">-5</second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with number', () => {
  const obj = new QuestObject({name:'test_object', testAtt:12, second:-5})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:12,\n  second:-5,\n})'
  expect(result).toBe(expected);
});



test('toXml with regex', () => {
  const obj = new QuestObject({name:'test_object', testAtt:/abcd/, second:/^([a-zA-Z]*) function/})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="regex">abcd</testAtt>\n    <second type="regex">^([a-zA-Z]*) function</second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with regex', () => {
  const obj = new QuestObject({name:'test_object', testAtt:/abcd/, second:/^([a-zA-Z]*) function/})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:/abcd/,\n  second:/^([a-zA-Z]*) function/,\n})'
  expect(result).toBe(expected);
});



test('toXml with stringlist', () => {
  const obj = new QuestObject({name:'test_object', testAtt:['one', 'two', 'three'], second:[]})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="stringlist">\n      <value>one</value>\n      <value>two</value>\n      <value>three</value>\n    </testAtt>\n    <second type="stringlist">\n    </second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with stringlist', () => {
  const obj = new QuestObject({name:'test_object', testAtt:['one', 'two', 'three'], second:[]})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:["one", "two", "three"],\n  second:[],\n})'
  expect(result).toBe(expected);
});



test('toXml with javascript', () => {
  const obj = new QuestObject({name:'test_object', testAtt:{type:'js', params:'', code:'msg("Hello")'}, second:{type:'js', params:'s', code:'if (s) {\n  msg("Hello" + s)\n}'}})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="js">\n      <params type="string"></params>\n      <code><![CDATA[msg("Hello")]]></code>\n    </testAtt>\n    <second type="js">\n      <params type="string">s</params>\n      <code><![CDATA[if (s) {\n  msg("Hello" + s)\n}]]></code>\n    </second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with javascript', () => {
  const obj = new QuestObject({name:'test_object', testAtt:{type:'js', params:'', code:'msg("Hello")'}, second:{type:'js', params:'s', code:'if (s) {\n  msg("Hello" + s)\n}'}})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:function() {\n    msg("Hello")\n  },\n  second:function(s) {\n    if (s) {\n      msg("Hello" + s)\n    }\n  },\n})'
  expect(result).toBe(expected);
});



test('toXml with script', () => {
  const obj = new QuestObject({name:'test_object', testAtt:{type:'script', code:'msg("Hello")'}, second:{type:'script', code:'if (s) {\n  msg("Hello" + s)\n}'}})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <testAtt type="script">\n      <code><![CDATA[msg("Hello")]]></code>\n    </testAtt>\n    <second type="script">\n      <code><![CDATA[if (s) {\n  msg("Hello" + s)\n}]]></code>\n    </second>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with script', () => {
  const obj = new QuestObject({name:'test_object', testAtt:{type:'script', code:'msg("Hello")'}, second:{type:'script', code:'if (s) {\n  msg("Hello" + s)\n}'}})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  testAtt:undefined, // WARNING: This script has not been included as it is in ASLX, not JavaScript\n  second:undefined, // WARNING: This script has not been included as it is in ASLX, not JavaScript\n})'
  expect(result).toBe(expected);
});



test('toXml with simple exit', () => {
  const obj = new QuestObject({name:'test_object', north:new Exit('library'), south:new Exit('hall')})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <exit alias="north" to="library">\n    </exit>\n    <exit alias="south" to="hall">\n    </exit>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with simple exit', () => {
  const obj = new QuestObject({name:'test_object', north:new Exit('library'), south:new Exit('hall')})
  const result = obj.toJs()
  const expected = '\n\n\ncreateItem("test_object", {\n  north:new Exit("library"),\n  south:new Exit("hall"),\n})'
  expect(result).toBe(expected);
});

test('toXml with msg exit', () => {
  const obj = new QuestObject({name:'test_object', north:new Exit('library', {useType:'msg', msg:'You go into the library.'})})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <exit alias="north" to="library">\n      <useType>msg</useType>\n      <msg><![CDATA[You go into the library.]]></msg>\n    </exit>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with msg exit', () => {
  const obj = new QuestObject({name:'test_object', north:new Exit('library', {useType:'msg', msg:'You go into the library.'})})
  const result = obj.toJs()
  const expected = `


createItem("test_object", {
  north:new Exit("library", {
    msg:"You go into the library.",
  }),
})`  
  expect(result).toBe(expected);
});


test('toXml with function exit', () => {
  const obj = new QuestObject({name:'test_object', east:new Exit('library', {useType:'custom', use:'msg("You go into the library.")'})})
  const result = obj.toXml()
  const expected = '  <object name="test_object">\n    <exit alias="east" to="library">\n      <useType>custom</useType>\n      <use><![CDATA[msg("You go into the library.")]]></use>\n    </exit>\n  </object>\n\n'
  expect(result).toBe(expected);
  
  const obj2 = createFromXml(result)
  expect(obj).toEqual(obj2)
});

test('toJs with function exit', () => {
  const obj = new QuestObject({name:'test_object', east:new Exit('library', {useType:'custom', use:'msg("You go into the library.")'})})
  const result = obj.toJs()
  const expected = `


createItem("test_object", {
  east:new Exit("library", {
    use:function() {
      msg("You go into the library.")
    },
  }),
})`
  expect(result).toBe(expected);
});








test('new QuestObject item', () => {
  const xml = `
      <object name="apprentice">
        <inherit name="editor_object" />
        <alias>Kendall</alias>
        <usedefaultprefix type="boolean">false</usedefaultprefix>
        <look>Kendall is nineteen, a short, slim man, with long, rather unkempt hair.</look>
        <object name="janthherb">
          <inherit name="editor_object" />
          <alias>Janthherb</alias>
          <look>Janthherb is a blue flower that grows in damp, but sheltered locations, usually prefering lower altitudes. The important part of te plant is the short, thin leaf.</look>
        </object>
        <object name="appentice_genymedes">
          <inherit name="editor_object" />
          <inherit name="startingtopic" />
          <alias>Genymedes</alias>
        </object>
      </object>
    </object>`

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, "text/xml")
  const obj = new QuestObject(xmlDoc.documentElement, 550)
  console.log(obj)
  expect(obj.name).toBe("apprentice")
  expect(obj.desc).toBe("Kendall is nineteen, a short, slim man, with long, rather unkempt hair.")
  expect(obj.alias).toBe("Kendall")
});








//*/