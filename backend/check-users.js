const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('All users in database:');
    console.log('======================\n');
    
    for (const user of users) {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    }
    
    console.log(`\nTotal users: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
