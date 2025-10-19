const { spawn } = require('child_process');
const net = require('net');

function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      // Port is in use, try next port
      findAvailablePort(startPort + 1).then(resolve).catch(reject);
    });
  });
}

async function startDevServer() {
  const port = await findAvailablePort();
  console.log(`Starting Next.js on port ${port}`);
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port }
  });
  
  // Wait for server to be ready
  await new Promise((resolve) => {
    setTimeout(resolve, 5000); // Wait 5 seconds for Next.js to start
  });
  
  return port;
}

if (require.main === module) {
  startDevServer().then(port => {
    console.log(`Next.js server ready on port ${port}`);
    process.exit(0);
  });
}

module.exports = { startDevServer, findAvailablePort };

