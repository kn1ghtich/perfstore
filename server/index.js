const app = require('./src/app');
const env = require('./src/config/env');
const connectMongo = require('./src/config/mongo');

async function start() {
  // Connect to MongoDB
  await connectMongo();

  // Start server
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
