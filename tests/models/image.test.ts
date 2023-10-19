import { Models } from "mongoose"

var ImageModel = require("../../models/image")

describe("Image Model", function () {
  var image: Models

  it("should have a mongoose schema", function () {
    expect(ImageModel.schema).to.exist
  })

  beforeEach(function () {
    image = new ImageModel({
      title: "Test",
      description: "Testing",
      filename: "testfile.jpg",
    })
  })

  describe("Schema", function () {
    it("should have a title string", function () {
      expect(image.title).to.exist
    })
    it("should have a description string", function () {
      expect(image.description).to.exist
    })
    it("should have a filename string", function () {
      expect(image.filename).to.exist
    })
    it("should have a views number default to 0", function () {
      expect(image.views).to.exist
      expect(image.views).to.equal(0)
    })
    it("should have a likes number default to 0", function () {
      expect(image.likes).to.exist
      expect(image.likes).to.equal(0)
    })
    it("should have a timestamp date", function () {
      expect(image.timestamp).to.exist
    })
  })

  describe("Virtuals", function () {
    describe("uniqueId", function () {
      it("should be exist", function () {
        expect(image.uniqueId).to.exist
      })
      it("should get filename without extension", function () {
        expect(image.uniqueId).to.equal("testfile")
      })
    })
  })
})
