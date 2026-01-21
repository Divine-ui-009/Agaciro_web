const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const plainPassword = process.env.SUPERADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      admin.password = plainPassword; // ✅ plain
      admin.isVerified = true;
      admin.isSuperAdmin = true;
      await admin.save();

      console.log('Admin existed — password reset correctly');
      return;
    }

    await User.create({
      userName: 'Olivier',
      email: 'kwizeraolivier2006@gmail.com',
      phone: '+250790096244',
      password: plainPassword, // ✅ plain
      role: 'admin',
      isVerified: true,
      isSuperAdmin: true,
    });

    console.log('Super admin created successfully');

  } catch (err) {
    console.error('Error seeding admin: ', err.message);
  }
}

module.exports = seedAdmin;
