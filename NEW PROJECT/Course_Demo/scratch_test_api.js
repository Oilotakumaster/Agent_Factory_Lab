async function testLogin() {
    const userIdInput = "kj";
    const passwordInput = "1234";
    const apiUrl = `https://courseserviceazure20251029225833-gphmevf4a9dcfae8.japanwest-01.azurewebsites.net/course/login/${encodeURIComponent(userIdInput)}/${encodeURIComponent(passwordInput)}`;
    console.log("Fetching URL:", apiUrl);
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        console.log("Allowed courses from Azure:", data);
    } catch (e) {
        console.log("Error:", e);
    }
}
testLogin();
