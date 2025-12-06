require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tenantRoutes = require('./routes/tenantRoutes');
const insightsRoutes = require('./routes/insightsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.send('Xeno FDE Ingestion Service Running');
});

// Routes
app.use('/api', tenantRoutes); // mount at /api (e.g. /api/shopify/connect)
app.use('/api/insights', insightsRoutes); // mount at /api/insights

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
