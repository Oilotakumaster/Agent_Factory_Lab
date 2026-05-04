const token = "17770147498545eNe7EuuAmx8vtmvqd5O7tDOblZad";

async function testDacastApi() {
    console.log("Testing Dacast API with developer.dacast.com...");
    try {
        const res = await fetch("https://developer.dacast.com/v2/vod", {
            method: "GET",
            headers: {
                "X-Api-Key": token,
                "Accept": "application/json"
            }
        });
        
        const status = res.status;
        const data = await res.json();
        console.log("Status:", status);
        if (status === 200 && data.data) {
            console.log(`Successfully retrieved ${data.data.length} videos!`);
            if (data.data.length > 0) {
                console.log("First Video ID:", data.data[0].id);
                console.log("First Video Title:", data.data[0].title);
            }
        } else {
            console.log("Response data:", data);
        }
    } catch (e) {
        console.log("Error:", e);
    }
}

testDacastApi();
