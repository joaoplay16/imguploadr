var models = require("../models");

module.exports = async function () {
  var stats = {
    images: await models.Image.count().exec(),
    comments: await models.Comment.count().exec(),
    views: await models.Image.aggregate([
      {
        $group: {
          _id: "1",
          viewsTotal: { $sum: "$views" },
        },
      },
    ]).exec()
      .then((result) => {
        var viewsTotal = 0;
        viewsTotal += result[0]?.viewsTotal || 0;

        return viewsTotal;
      }),
    likes: await models.Image.aggregate([
      {
        $group: {
          _id: "1",
          likesTotal: { $sum: "$likes" },
        },
      },
    ]).exec()
      .then((result) => {
        var likesTotal = 0;
        likesTotal += result[0]?.likesTotal || 0;

        return likesTotal;
      }),
  };
  return stats;
};
