import * as sinon from "sinon"
import * as chai from "chai"

declare global {
  var expect: Chai.ExpectStatic
}

var sinonChai = require("sinon-chai")
chai.use(sinonChai)

global.expect = chai.expect
global.sinon = sinon
