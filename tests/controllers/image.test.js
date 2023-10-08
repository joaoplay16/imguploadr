var proxyquire = require("proxyquire"),
  callback = sinon.spy(),
  sidebarStub = sinon.stub(),
  fsStub = {},
  pathStub = {},
  md5Stub = {},
  ModelsStub = {
    Image: {
      findOne: sinon.stub().returns({ exec: () => sinon.promise() }),
    },
    Comment: {
      find: sinon.stub().returns({ exec: () => sinon.promise() }),
    },
  },
  image = proxyquire("../../controllers/image", {
    "../helpers/sidebar": sidebarStub,
    "../models": ModelsStub,
    fs: fsStub,
    path: pathStub,
    md5: md5Stub,
  }),
  res = {},
  req = {},
  testImage = {},
  testComents = []

describe("Image Controller", function () {
  beforeEach(function () {
    res = {
      render: sinon.spy(),
      json: sinon.spy(),
      redirect: sinon.spy(),
    }
    req.params = {
      image_id: "testing",
    }
    testImage = {
      _id: 1,
      title: "Test Image",
      views: 0,
      likes: 0,
      save: sinon.spy(),
    }
  })
  describe("Index", function () {
    it("should be defined", function () {
      expect(image.index).to.exist
    })
    it("should call Models.Image.findOne", function () {
      image.index(req, res)
      expect(ModelsStub.Image.findOne).to.be.called
    })
    it("should find Image by parameter id", function () {
      image.index(req, res)
      expect(ModelsStub.Image.findOne).to.be.calledWith({
        filename: { $regex: "testing" },
      })
    })
    describe("with found image model", function () {
      beforeEach(function () {
        ModelsStub.Image.findOne = sinon.stub().returns({
          exec: () => sinon.promise().resolve(testImage),
        })
        ModelsStub.Comment.find = sinon
          .stub()
          .withArgs(
            { image_id: 1 },
            {},
            {
              sort: {
                timestamp: 1,
              },
            }
          )
          .returns({
            exec: () =>
              sinon.promise().resolve({
                comments: [
                  {
                    image_id: 1,
                  },
                ],
              }),
          })
      })
      it("should incremement views by 1 and save", async function () {
        await image.index(req, res)
        expect(testImage.views).to.equal(1)
        expect(testImage.save).to.be.called
      })
      it("should find related comments", async function () {
        await image.index(req, res)
        expect(ModelsStub.Comment.find).to.be.calledWith(
          { image_id: 1 },
          {},
          { sort: { timestamp: 1 } }
        )
      })
      it("should execute sidebar", async function () {
        await image.index(req, res)
        expect(ModelsStub.Comment.find).to.be.called
        expect(sidebarStub).to.be.called
      })
      it("should render image template with image and comments", function (done) {
        image.index(req, res)
        done()
        expect(sidebarStub).to.be.calledWith({
          image: testImage,
          comments: [
            {
              image_id: 1,
            },
          ],
        })

        expect(res.render).to.be.calledWith("image", sinon.match.object)
      })
    })
  })
})
