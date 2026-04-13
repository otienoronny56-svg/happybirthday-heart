const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const request = https.get(url, options, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                console.log(`Following redirect to: ${response.headers.location}`);
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            // Check content type
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.includes('audio')) {
                console.log(`Warning: Content-Type is ${contentType}, but proceeding...`);
            }

            response.pipe(file);
        });

        file.on('finish', () => {
            file.close();
            const stats = fs.statSync(dest);
            if (stats.size < 1000) {
                reject(new Error(`File too small: ${stats.size} bytes`));
            } else {
                console.log(`Download successful! size: ${stats.size}`);
                resolve();
            }
        });

        request.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const url = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Happy_Birthday_to_You_%28Piano_Instrumental%29.mp3";
const target = path.join(__dirname, 'assets', 'birthday_piano.mp3');

download(url, target).catch(err => {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
});
