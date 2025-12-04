const https = require('https');

const bucketUrl = 'https://strapi-bucket-kamaluso.s3.sa-east-1.amazonaws.com/processed/';
const newImageUUID = 'db1dee56-da00-41af-879b-007852237869'; // The one failing
const oldImageUUID = 'e6287968-072f-4f8c-996a-013572eb4ce4'; // One that works

const variants = ['480w', '800w'];

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ url, statusCode: res.statusCode });
        }).on('error', (e) => {
            resolve({ url, error: e.message });
        });
    });
}

async function run() {
    console.log('Checking image access permissions...\n');

    console.log('--- NEW IMAGE (Should fail if permissions are wrong) ---');
    for (const v of variants) {
        const url = `${bucketUrl}${newImageUUID}-${v}.webp`;
        const result = await checkUrl(url);
        console.log(`${v}: ${result.statusCode} ${result.statusCode === 200 ? '✅ OK' : '❌ FAIL'}`);
    }

    console.log('\n--- OLD IMAGE (Should work) ---');
    for (const v of variants) {
        const url = `${bucketUrl}${oldImageUUID}-${v}.webp`;
        const result = await checkUrl(url);
        console.log(`${v}: ${result.statusCode} ${result.statusCode === 200 ? '✅ OK' : '❌ FAIL'}`);
    }
}

run();
