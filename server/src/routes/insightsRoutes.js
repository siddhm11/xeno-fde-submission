const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

// GET /api/insights/stats?tenantId=X
router.get('/stats', insightsController.getStats);

// GET /api/insights/sales-over-time?tenantId=X
router.get('/sales-over-time', insightsController.getSalesOverTime);

// GET /api/insights/top-customers?tenantId=X
router.get('/top-customers', insightsController.getTopCustomers);

module.exports = router;
