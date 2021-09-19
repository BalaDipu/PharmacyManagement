const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('./../../models/medicineModel');
const User = require('./../../models/userModel');
const Review = require('../../models/reviewModel');

//database connection
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => console.log('DB connection in progress'));

//Read json file
const medicines = JSON.parse(fs.readFileSync(`${__dirname}/medicines.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//import data into database
const importData = async () => {
  try {
    await Medicine.create(medicines);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('data niye felche');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Medicine.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data shob shesh vaiya!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// node dev-data/data/import-dev-data.js --import
//node dev-data/data/import-dev-data.js --delete