// 最小 mongoose 隔离测试
console.log('=== Step 1: require mongoose ===');
try {
  const mongoose = require('mongoose');
  console.log('OK, mongoose version:', mongoose.version);
} catch (e) {
  console.log('FAIL:', e.message);
  process.exit(1);
}

console.log('=== Step 2: check env ===');
const uri = process.env.MONGODB_URI;
if (uri) {
  console.log('OK, MONGODB_URI length:', uri.length, 'ends with:', uri.slice(-40));
} else {
  console.log('FAIL: MONGODB_URI not set');
  process.exit(1);
}

console.log('=== Step 3: dns resolve ===');
const dns = require('dns');
dns.resolve('cluster0.zz5s9za.mongodb.net', (err, addresses) => {
  if (err) {
    console.log('FAIL:', err.message);
    process.exit(1);
  }
  console.log('OK, IPs:', addresses.join(', '));

  console.log('=== Step 4: tcp connect ===');
  const net = require('net');
  const sock = net.createConnection({ host: addresses[0], port: 27017 }, () => {
    console.log('OK, TCP connected to', addresses[0]);
    sock.end();
    console.log('=== Basic connectivity OK, now try mongoose ===');

    console.log('=== Step 5: mongoose connect ===');
    const mongoose = require('mongoose');
    mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 })
      .then(() => {
        console.log('OK, mongoose connected!');
        return mongoose.disconnect();
      })
      .then(() => {
        console.log('=== ALL TESTS PASSED ===');
        process.exit(0);
      })
      .catch(err => {
        console.log('FAIL mongoose connect:', err.message);
        console.log('Error code:', err.code);
        console.log('Error name:', err.name);
        process.exit(1);
      });
  });
  sock.on('error', (err) => {
    console.log('FAIL TCP:', err.message);
    process.exit(1);
  });
  sock.setTimeout(10000, () => {
    console.log('FAIL TCP timeout');
    sock.destroy();
    process.exit(1);
  });
});
