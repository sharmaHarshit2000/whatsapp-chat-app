const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PAYLOAD_DIR = path.join(__dirname, '..', 'payloads');
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:4000/webhook';

async function main() {
  const files = fs.readdirSync(PAYLOAD_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(PAYLOAD_DIR, f), 'utf8');
    const json = JSON.parse(content);
    console.log('Posting', f, 'to', WEBHOOK_URL);
    try {
      const resp = await axios.post(WEBHOOK_URL, json, { timeout: 5000 });
      console.log('->', resp.data);
    } catch (err) {
      console.error('Error posting', f, err.message);
    }
  }
}

main();
