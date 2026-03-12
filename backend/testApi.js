import { io } from 'socket.io-client';
import mongoose from 'mongoose';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function runFullSimulation() {
    console.log("--- Starting End-to-End Prahari Simulation ---");
    
    const ts = Date.now();
    
    // 1. Create User
    console.log("1. Registering Victim User...");
    const userRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Victim User', email: `victim${ts}@test.com`, phone: `111${ts}`, password: 'pass', role: 'user' })
    });
    const userData = await userRes.json();
    console.log(`   User Registered. Token: ${userData.token.substring(0,10)}...`);

    // 2. Create Helper
    console.log("2. Registering Helper...");
    const helperRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hero Helper', email: `helper${ts}@test.com`, phone: `222${ts}`, password: 'pass', role: 'helper' })
    });
    const helperData = await helperRes.json();
    console.log(`   Helper Registered. Token: ${helperData.token.substring(0,10)}...`);

    // Auto-verify Helper in DB
    console.log("   Auto-verifying helper in Database...");
    await mongoose.connect('mongodb://localhost:27017/prahari');
    // Using raw collection without schema
    await mongoose.connection.db.collection('helpers').updateOne(
        { "userId": new mongoose.Types.ObjectId(helperData._id) },
        { $set: { "verificationStatus": "verified" } }
    );
    await mongoose.disconnect();
    console.log("   Helper Verified.");

    // 3. Connect Sockets
    console.log("\n3. Connecting WebSockets...");
    const userSocket = io(SOCKET_URL, { auth: { token: userData.token } });
    const helperSocket = io(SOCKET_URL, { auth: { token: helperData.token } });
    
    await delay(1000);
    console.log("   Sockets Connected.");

    // Helper Location Update (makes them available in DB)
    console.log("4. Helper broadcasting live location (Delhi)...");
    helperSocket.emit('helper:update_location', { lng: 77.2090, lat: 28.6139 });
    
    await delay(1000);

    // Setup Listeners
    helperSocket.on('sos:alert', (data) => {
        console.log(`   [HELPER SOCKET] Received incoming SOS Request! ID: ${data.sosId}`);
        // Immediately accept it
        console.log(`   [HELPER SOCKET] Accepting SOS Request ID: ${data.sosId}...`);
        helperSocket.emit('sos:accept', { sosId: data.sosId });
    });

    helperSocket.on('sos:success', (data) => {
         console.log(`   [HELPER SOCKET] Successfully matched and assigned to SOS!`);
    });

    userSocket.on('sos:assigned', (data) => {
         console.log(`   [USER SOCKET] Help is on the way! Helper Assigned: ${data.helper.name}`);
         
         // Finalize Test
         console.log("\n--- Simulation Completed Successfully ---");
         process.exit(0);
    });

    // 5. Trigger SOS
    console.log("\n5. User Triggering SOS (also in Delhi)...");
    const sosRes = await fetch(`${API_URL}/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userData.token}` },
        body: JSON.stringify({ lng: 77.2091, lat: 28.6140 }) // Right next to helper
    });
    
    const sosData = await sosRes.json();
    console.log(`   SOS Created. Notified ${sosData.sos.notifiedHelpers.length} helpers.`);

    // Give it 5 seconds to resolve
    await delay(5000);
    console.log("Simulation Timed out.");
    process.exit(1);
}

runFullSimulation().catch(console.error);
