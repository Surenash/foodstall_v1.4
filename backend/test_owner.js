const { query } = require('./config/database');
async function test() {
    try {
        const stalls = await query('SELECT id, owner_id FROM stalls LIMIT 1;');
        const stall = stalls.rows[0];

        const statRes = await fetch(`http://localhost:3000/api/v1/owner/status`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stall_id: stall.id,
                owner_id: stall.owner_id,
                is_open: true,
                location: { lat: 19.1, long: 72.9 }
            })
        });
        const statData = await statRes.json();
        console.log("Update status/location:", statData.success);

        const menuRes = await fetch(`http://localhost:3000/api/v1/owner/menu`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stall_id: stall.id,
                owner_id: stall.owner_id,
                menu_text: "New Item: 50Rs"
            })
        });
        const menuData = await menuRes.json();
        console.log("Update menu:", menuData.success);

        // Can't easily test multipart form data in fetch without FormData/fs, but skipping testing file upload since it's standard multer

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
