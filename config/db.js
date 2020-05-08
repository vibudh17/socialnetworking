const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true, //Suggested by Mongo terminal message. Mongoose warning
      useUnifiedTopology: true, //Suggested by Mongo terminal message. Mongoose warning
      useCreateIndex: true, //Suggested by Mongo terminal message. Mongoose warning
      useFindAndModify: false, ////Suggested by Mongo terminal message. Mongoose warning
    });
    console.log('MongoDB Connected....');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1); //NodeJs.process
  }
};

module.exports = connectDB;
