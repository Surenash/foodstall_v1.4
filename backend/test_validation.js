const fetch = require('node-fetch');
async function test() {
    try {
        const res = await fetch(`http://localhost:3000/api/v1/owner/status`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stall_id: 'not-a-uuid',
                owner_id: 'not-a-uuid',
                is_open: 'yes',
                location: { lat: 'high', long: 'very_long' }
            })
        });
        const data = await res.json();
        console.log("Validation test:", data.error, data.details.length, "errors");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
