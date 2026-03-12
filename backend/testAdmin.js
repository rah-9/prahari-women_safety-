const API_URL = 'http://localhost:5000/api';

async function seedAndVerify() {
  // 1. Login as admin
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@prahari.com', password: 'admin123' })
  });
  const admin = await loginRes.json();
  console.log('Admin logged in:', admin.name);

  // 2. Seed demo data
  const seedRes = await fetch(`${API_URL}/admin/seed`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const seedData = await seedRes.json();
  console.log('Seed result:', seedData.message);

  // 3. Get analytics
  const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const analytics = await analyticsRes.json();
  console.log('Analytics stats:', JSON.stringify(analytics.stats, null, 2));
  console.log('SOS per day:', analytics.sosPerDay);
  console.log('Recent SOS count:', analytics.recentSOS.length);

  // 4. Get users
  const usersRes = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const users = await usersRes.json();
  console.log('Total users:', users.length);

  // 5. Get helpers
  const helpersRes = await fetch(`${API_URL}/admin/helpers`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const helpers = await helpersRes.json();
  console.log('Total helpers:', helpers.length);

  console.log('\n--- All admin APIs verified successfully ---');
  process.exit(0);
}

seedAndVerify().catch(console.error);
