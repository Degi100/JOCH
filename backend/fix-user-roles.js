// Script to fix user roles in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  name: String,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

async function fixUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users that are not admin
    const users = await User.find({ role: { $ne: 'admin' } });
    
    console.log(`Found ${users.length} non-admin users`);
    
    for (const user of users) {
      console.log(`User: ${user.email}, Current role: ${user.role}`);
      
      // Update role to 'user' if it's currently 'member'
      if (user.role === 'member') {
        await User.updateOne(
          { _id: user._id },
          { $set: { role: 'user' } }
        );
        console.log(`  ✓ Updated ${user.email} from 'member' to 'user'`);
      }
    }
    
    console.log('\nDone! All non-admin users now have role "user"');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUserRoles();
