var proxyquire = require("proxyquire"),
  callback = sinon.spy(),
  sidebarStub = sinon
    .stub()
    .returns(sinon.promise().resolve({ image: {}, comments: [] })),
  fsStub = {
    rename: sinon.spy(),
  },
  pathStub = {},
  md5Stub = {},
  ModelsStub = {
    Image: {
      findOne: sinon.stub().returns({ exec: () => sinon.promise() }),
      find: sinon.stub().returns({ exec: () => sinon.promise() }),
      save: sinon.stub().returns({ exec: () => sinon.promise() }),
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
    testComents = [
      {
        image_id: 1,
        email: "example@example.com",
        name: "example",
        gravatar: "",
        comment: "Nice",
        timestamp: 0,
      },
    ]
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
            exec: () => sinon.promise().resolve(testComents),
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
        expect(sidebarStub).to.be.calledWith({
          image: testImage,
          comments: testComents,
        })
      })
      it("should render image template with image and comments", async function () {
        await image.index(req, res)
        // use `done` to tell to the test to wait all async operations finish before
        // do the assertions
        expect(sidebarStub).to.be.called

        expect(res.render).to.be.calledWith("image", {
          image: sinon.match.object,
          comments: sinon.match.array,
        })
      })

      it("should redirect to '/' when image is not found", async function () {
        ModelsStub.Image.findOne = sinon
          .stub()
          .returns({ exec: () => sinon.promise().resolve(null) })

        await image.index(req, res)

        expect(res.redirect).to.be.calledWith("/")
      })
    })
  })

  // describe("Create", function () {
  //   describe("with uploaded image data", function () {
  //     beforeEach(function () {
  //       ModelsStub.Image.find = sinon
  //         .stub()
  //         .returns({ exec: () => sinon.promise().resolve([]) })

  //       req.file = {
  //         originalName: "image.png",
  //         path: "/home/user/images",
  //         title: "jaberwok",
  //         description: "jaberwok is a poem",
  //       }
  //     })
  //     it("should create and save an image", function (done) {
  //       image.create(req, res)
  //       expect(res.redirect).to.be.called
  //       done()
  //     })
  //   })
  // })
})
