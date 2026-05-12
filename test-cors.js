const https = require('https');

const options = {
  hostname: 'api.horizoneinvest.com',
  port: 443,
  path: '/api/site-links',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://horizoneinvest.com',
    'Access-Control-Request-Method': 'GET',
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
