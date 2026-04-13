const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://www.chosic.com/wp-content/uploads/2021/04/Happy-Birthday-Piano-Instrumental.mp3";
const dest = path.join(__dirname, 'assets', 'birthday_piano.mp3');

if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
}

const file = fs.createWriteStream(dest);

// Chosic might need a User-Agent header
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

https.get(url, options, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        https.get(response.headers.location, options, (res) => {
            res.pipe(file);
        });
    } else if (response.statusCode !== 200) {
        console.error(`Failed to download: ${response.statusCode}`);
    } else {
        response.pipe(file);
    }
    
    file.on('finish', () => {
        file.close();
        console.log("Download complete: assets/birthday_piano.mp3");
    });
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error: ${err.message}`);
});
