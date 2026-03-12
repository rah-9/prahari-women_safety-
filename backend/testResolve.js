// Quick test script to trigger and resolve an SOS
const API_URL = 'http://localhost:5000/api';

async function testResolutionFlow() {
  // 1. Get the admin token
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@prahari.com', password: 'admin123' })
  });
  const admin = await loginRes.json();
  
  // 2. See analytics before
  const analyticsBefore = await fetch(`${API_URL}/admin/analytics`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  }).then(res => res.json());

  console.log('Before resolution:', {
    active: analyticsBefore.stats.activeSOS,
    resolved: analyticsBefore.stats.resolvedSOS
  });

  // We know there are unassigned/demo SOS requests seeded. Let's just create one and resolve it to verify the counter increments.
}

testResolutionFlow().catch(console.error);
