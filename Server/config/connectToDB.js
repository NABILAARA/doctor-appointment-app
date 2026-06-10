const mongoose = require('mongoose');

const connectToDB = () => {
  mongoose.connect(process.env.MONGO_DB)
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.log('❌ DB Error:', err.message));
};

module.exports = connectToDB;
