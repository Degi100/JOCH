const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Get all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('Current users:');
    for (const user of users) {
      console.log(`- ${user.email} (${user.role})`);
    }
    
    // Delete all non-admin users
    const result = await mongoose.connection.db.collection('users').deleteMany({
      role: { $ne: 'admin' }
    });
    
    console.log(`\n✓ Deleted ${result.deletedCount} non-admin users`);
    console.log('\nNow only admin users remain. Fresh start for testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanup();
