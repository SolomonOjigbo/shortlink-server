const Url = require('../../models/Url');

const insertTestUrls = async (urls) => {
  await Url.insertMany(urls);
};

const clearDatabase = async () => {
  await Url.deleteMany({});
};

module.exports = {
  insertTestUrls,
  clearDatabase
};