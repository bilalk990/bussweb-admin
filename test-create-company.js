const fs = require('fs');
const path = require('path');

async function testCompanyCreation() {
    console.log("Starting test...");

    // 1. Get token
    let token = "";
    try {
        const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@fastbuss.com", password: "12345678" })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            // try another super admin let's just see
            const loginRes2 = await fetch("http://localhost:5000/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@gmail.com", password: "password" })
            });
            const loginData2 = await loginRes2.json();
            if (loginRes2.ok) token = loginData2.token;
            else {
                // try test_admin@example.com
                console.log("Login failed");
                return;
            }
        } else {
            token = loginData.token;
        }
        console.log("Login success! Token:", token.substring(0, 20) + "...");
    } catch (e) {
        console.error("Login fetch error:", e);
        return;
    }

    // 2. Create FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('companyName', 'Script Test Company');
    form.append('contactEmail', 'script@example.com');
    form.append('contactPhone', '1234567890');
    form.append('adminName', 'Script Admin');
    form.append('adminPassword', 'password123');
    form.append('description', 'Test Description');

    // Add a dummy file
    const fileBuf = Buffer.from('dummy image data');
    form.append('logo', fileBuf, 'dummy.png');

    console.log("Sending POST to create-sub-company...");
    try {
        const createRes = await fetch("http://localhost:5000/api/v1/super-admin/create-sub-company", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                // do NOT set content-type for node-fetch with FormData, it does it itself
                // wait, native fetch needs no headers for form-data, but if we use formidable/form-data we might need it.
                // for node 18 fetch, we should use native FormData
            },
            body: form
        });
        const bodyText = await createRes.text();
        console.log("Response status:", createRes.status);
        console.log("Response body:", bodyText);
    } catch (e) {
        console.error("Create fetch error:", e);
    }
}

testCompanyCreation();
