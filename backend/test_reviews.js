const { query } = require('./config/database');
async function test() {
    try {
        const users = await query('SELECT id FROM users LIMIT 2;');
        const stalls = await query('SELECT id FROM stalls LIMIT 1;');
        const user1 = users.rows[0].id;
        const user2 = users.rows[1].id;
        const stallId = stalls.rows[0].id;

        const revRes = await fetch(`http://localhost:3000/api/v1/stalls/reviews`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stall_id: stallId,
                user_id: user2,
                rating: 4,
                hygiene_score: 3,
                hygiene_responses: {
                    vendor_wears_gloves: false,
                    filtered_water_visible: true,
                    clean_utensils: true,
                    covered_food_storage: true
                },
                comment: 'Good food, but no gloves.'
            })
        });
        const revData = await revRes.json();
        console.log("Submit review:", revData.success);

        const getRevRes = await fetch(`http://localhost:3000/api/v1/stalls/${stallId}/reviews?page=1&limit=5`);
        const getRevData = await getRevRes.json();
        console.log("Get reviews:", getRevData.success, "Count:", getRevData.count, "Total:", getRevData.total);

        const getStallRes = await fetch(`http://localhost:3000/api/v1/stalls/${stallId}`);
        const getStallData = await getStallRes.json();
        console.log("Stall Hygiene Score updated correctly:", getStallData.stall.hygiene_score);

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
