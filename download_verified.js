const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://github.com/rafaelreis-hotmart/Happy-Birthday/raw/master/happy-birthday.mp3";
const targetPath = path.join(__dirname, 'assets', 'birthday_piano.mp3');

console.log(`Starting download from: ${url}`);

const file = fs.createWriteStream(targetPath);

const request = https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
}, (response) => {
    // Check if it's an audio file
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('audio')) {
        console.error(`ERROR: Response is not audio. Content-Type: ${contentType}`);
        // If it's HTML, it's likely a block page
        process.exit(1);
    }

    response.pipe(file);

    file.on('finish', () => {
        file.close();
        const stats = fs.statSync(targetPath);
        if (stats.size < 100000) { // Less than 100KB is suspicious for a full song
            console.error(`ERROR: File size is too small (${stats.size} bytes). Likely partial/invalid.`);
            fs.unlinkSync(targetPath);
            process.exit(1);
        }
        console.log(`Download successful! File size: ${stats.size} bytes.`);
    });
});

request.on('error', (err) => {
    console.error(`Download error: ${err.message}`);
    fs.unlinkSync(targetPath);
    process.exit(1);
});
