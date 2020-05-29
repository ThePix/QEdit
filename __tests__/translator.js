'use strict';

//import test from 'ava';
const [ASL2JS] = require('../src/translators/asl2js.js')




test('test 1', () => {
  const asl = `
      if (HasString(this, "alias")) {
        s = CapFirst(this.alias)
      }
      else {
        s = CapFirst(this.name)
      }
      if (HasString(this, "listalias")) s = this.listalias
      this.listalias = "<span style=\"color:#800000;font-weight:bold;\">" + s + "</span>"
`
  const result = ASL2JS.aslToJs(asl)
  expect(result.length).toBe(10);
});

/*
test('test 1', t => {
  const asl = `
      if (HasString(this, "alias")) {
        s = CapFirst(this.alias)
      }
      else {
        s = CapFirst(this.name)
      }
      if (HasString(this, "listalias")) s = this.listalias
      this.listalias = "<span style=\"color:#800000;font-weight:bold;\">" + s + "</span>"
`
  const result = ASL2JS.aslToJs(asl)
  t.is(result.length, 10);
});
*/
