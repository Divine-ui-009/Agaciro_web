const User = require('./models/User');

async function seedAdmin() {
  try {
    const admin = await User.findOne({ role: 'admin' });

    if (admin) {
      console.log('Admin already exists — skipping seeding.');
      return;
    }

    await User.create({
      userName: 'Olivier',
      email: 'kwizeraolivier2006@gmail.com',
      phone: '+250790096244',
      password: process.env.SUPERADMIN_PASSWORD || 'Admin@123', // ✅ plain
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
