const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // 실패 시 앱 종료
  }
};

module.exports = connectDB;
