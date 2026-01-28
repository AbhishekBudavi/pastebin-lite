const express = require('express');
const cors = require('cors');
require('dotenv/config');

const pasteRoutes = require('./routes/pasteRoute');
const {
  errorHandler,
  notFound,
  testTimeMiddleware,
} = require('./middleware/handlers');

const { initializeSchema } = require('./db/schema');
const { query } = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());
app.use(testTimeMiddleware);

app.use('/api', pasteRoutes);


app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
   
    console.log('Checking database connection...');
    await query('SELECT 1');
    console.log('✓ Database connected');


    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('✓ Schema initialized');
console.log(process.env.NEXT_PUBLIC_APP_URL);


    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
