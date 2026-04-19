require('dotenv').config();
const express = require('express');
const cors = require('cors');
const migrate = require('./db/migrate');

const authRoutes = require('./routes/auth');
const brandRoutes = require('./routes/brand');
const agentRoutes = require('./routes/agent');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const communityRoutes = require('./routes/community');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Lens AI Marketing Agency API 🚀', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/community', communityRoutes);

app.use(errorHandler);

const start = async () => {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Lens API running on port ${PORT} 🚀`);
  });
};

start();

