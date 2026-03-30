const { query } = require('./config/database');
async function test() {
    try {
        const res = await fetch(`http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=5000`);
        const data = await res.json();
        console.log("Nearby stalls (Colaba):", data.count);
        if (data.stalls && data.stalls.length > 0) {
            console.log("First stall:", data.stalls[0].name, "Distance:", data.stalls[0].distance_km);
            console.log("Lat:", data.stalls[0].latitude, "Long:", data.stalls[0].longitude);
        }

        const resFilter = await fetch(`http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=50000&cuisine=South Indian&status=Closed`);
        const dataFilter = await resFilter.json();
        console.log("Filtered stalls (South Indian, Closed):", dataFilter.count);

        const resColl = await fetch(`http://localhost:3000/api/v1/stalls/collections/featured`);
        const dataColl = await resColl.json();
        console.log("Featured collections:", dataColl.success, "Collections:", dataColl.collections[0].title);

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
