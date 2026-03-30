const { query } = require('./config/database');

async function test() {
    try {
        const users = await query('SELECT * FROM users LIMIT 1;');
        const user = users.rows[0];
        console.log("User found:", user.id);

        const stalls = await query('SELECT * FROM stalls LIMIT 1;');
        const stall = stalls.rows[0];
        console.log("Stall found:", stall.id);

        // Fetch user profile
        const fetchRes = await fetch(`http://localhost:3000/api/v1/users/${user.id}`);
        const fetchData = await fetchRes.json();
        console.log("GET User:", fetchData.success);

        // Add favorite
        const favRes = await fetch(`http://localhost:3000/api/v1/users/${user.id}/favorites/${stall.id}`, { method: 'POST' });
        const favData = await favRes.json();
        console.log("Add Fav:", favData.success);

        // Check favorite
        const chkRes = await fetch(`http://localhost:3000/api/v1/users/${user.id}/favorites/${stall.id}/check`);
        const chkData = await chkRes.json();
        console.log("Check Fav:", chkData.is_favorited);

        // Remove favorite
        const rmFavRes = await fetch(`http://localhost:3000/api/v1/users/${user.id}/favorites/${stall.id}`, { method: 'DELETE' });
        const rmFavData = await rmFavRes.json();
        console.log("Rm Fav:", rmFavData.success);

        // Notification Test
        await query(`INSERT INTO notifications (user_id, title, message, type) VALUES ('${user.id}', 'Test', 'Test Msg', 'system')`);
        const notRes = await fetch(`http://localhost:3000/api/v1/users/${user.id}/notifications`);
        const notData = await notRes.json();
        console.log("Get Notifications:", notData.success, "Count:", notData.count || notData.notifications.length);

        // Report Test
        const repRes = await fetch(`http://localhost:3000/api/v1/users/reports`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.id, stall_id: stall.id, type: 'hygiene_issue', description: 'Test' })
        });
        const repData = await repRes.json();
        console.log("Add Report:", repData.success);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
test();
