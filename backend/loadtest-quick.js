const http = require('http');

const BASE_URL = 'http://localhost:8080';
const HOST = 'localhost';
const PORT = 8080;
const CONCURRENT_USERS = 50;
const REQUESTS_PER_USER = 10;

const endpoints = [
  { name: 'Home Page',  path: '/home-page' },
  { name: 'Products',   path: '/products?page=1&limit=20' },
  { name: 'Brands',     path: '/api/brands' },
];

const makeRequest = (path) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'x-loadtest': 'true',  // ✅ Skip rate limiter
      },
    };
    
    const req = http.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        resolve({
          time: Date.now() - start,
          status: res.statusCode,
          cache: res.headers['x-cache'] || 'N/A',
        });
      });
    });
    
    req.on('error', () => resolve({ time: 0, status: 0, cache: 'ERR' }));
    req.end();
  });
};

const runTest = async (endpoint) => {
  console.log('\n' + endpoint.name + ' - ' + endpoint.path);
  console.log('------------------------------------------------------------');
  
  // Warmup - populate cache
  console.log('Warming up cache...');
  await makeRequest(endpoint.path);
  await new Promise(r => setTimeout(r, 500));
  
  const promises = [];
  for (let u = 0; u < CONCURRENT_USERS; u++) {
    for (let r = 0; r < REQUESTS_PER_USER; r++) {
      promises.push(makeRequest(endpoint.path));
    }
  }
  
  const start = Date.now();
  const results = await Promise.all(promises);
  const totalTime = (Date.now() - start) / 1000;
  
  const successResults = results.filter(r => r.status === 200);
  const times = successResults.map(r => r.time).sort((a, b) => a - b);
  
  const statusCount = {};
  results.forEach(r => {
    statusCount[r.status] = (statusCount[r.status] || 0) + 1;
  });
  console.log('Status codes:', JSON.stringify(statusCount));
  
  if (times.length === 0) {
    console.log('FAIL: All requests failed!');
    return;
  }
  
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  
  const cacheHits = results.filter(r => r.cache === 'HIT').length;
  const cacheRate = ((cacheHits / results.length) * 100).toFixed(1);
  const rps = (results.length / totalTime).toFixed(0);
  
  console.log('Success:   ' + successResults.length + '/' + results.length);
  console.log('RPS:       ' + rps + ' req/s');
  console.log('Avg:       ' + avg.toFixed(0) + 'ms');
  console.log('p50:       ' + p50 + 'ms');
  console.log('p95:       ' + p95 + 'ms');
  console.log('p99:       ' + p99 + 'ms');
  console.log('Cache Hit: ' + cacheRate + '%');
};

(async () => {
  console.log('Quick Load Test (with x-loadtest header)');
  console.log('Users: ' + CONCURRENT_USERS + ' x ' + REQUESTS_PER_USER + ' requests');
  
  for (const endpoint of endpoints) {
    await runTest(endpoint);
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\nDone!\n');
  process.exit(0);
})();
