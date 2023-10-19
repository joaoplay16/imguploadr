var models = require("../models")

module.exports = {
  popular: async function () {
    return models.Image.find({}, {}, { limit: 9, sort: { likes: -1 } })
      .exec()
      .catch((err: Error) => {
        throw err
      })
  },
}
