const app = require('./src/app');
const env = require('./src/config/env');
const connectMongo = require('./src/config/mongo');

// Sync Product.in_stock for all products that have branch inventory records.
// Runs once on startup to fix any stale values in the DB.
async function syncProductStockFromBranches() {
  try {
    const Store   = require('./src/models/Store');
    const Product = require('./src/models/Product');

    // Build a map: productId -> total branch qty
    const stores = await Store.find().select('inventory').lean();
    const qtyMap = {};
    for (const store of stores) {
      for (const inv of store.inventory) {
        const pid = inv.product.toString();
        qtyMap[pid] = (qtyMap[pid] || 0) + (inv.quantity || 0);
      }
    }

    // Update every product that appears in at least one branch
    const productIds = Object.keys(qtyMap);
    if (productIds.length === 0) return;

    const bulkOps = productIds.map((pid) => ({
      updateOne: {
        filter: { _id: pid },
        update: { $set: { in_stock: qtyMap[pid] > 0, quantity: qtyMap[pid] } },
      },
    }));
    await Product.bulkWrite(bulkOps);
    console.log(`[startup] Synced in_stock + quantity for ${productIds.length} products from branch inventory`);
  } catch (err) {
    console.error('[startup] Failed to sync product stock:', err.message);
  }
}

async function start() {
  // Connect to MongoDB
  await connectMongo();

  // Fix any stale Product.in_stock values based on branch data
  await syncProductStockFromBranches();

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
