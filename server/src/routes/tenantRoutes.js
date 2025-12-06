const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// POST /api/shopify/connect
router.post('/shopify/connect', tenantController.connectTenant);

// POST /api/sync/:tenantId
router.post('/sync/:tenantId', tenantController.syncTenant);

module.exports = router;
