const http = require('http');

// Hit deployed Render backend courts endpoint
http.get('https://booking-court-app.onrender.com/api/courts', (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers, null, 2));
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (!data) {
      console.log('Empty body');
      return;
    }
    try {
      const json = JSON.parse(data);
      console.log('BODY', JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Non-JSON response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
