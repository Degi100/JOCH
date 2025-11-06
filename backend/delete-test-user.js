const mongoose = require('mongoose');
require('dotenv').config();

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await mongoose.connection.db.collection('users').deleteOne({
      email: 'r.degering@mail.de'
    });
    
    console.log(`Deleted ${result.deletedCount} user(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteUser();
