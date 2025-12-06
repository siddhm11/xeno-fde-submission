const shopifyService = require('../services/shopifyService');

exports.connectTenant = async (req, res) => {
    try {
        const { shopDomain, accessToken } = req.body;
        const tenant = await shopifyService.connectStore(shopDomain, accessToken);
        res.status(200).json({ success: true, tenant });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.syncTenant = async (req, res) => {
    try {
        const { tenantId } = req.params;
        // Trigger sync in background or await? Spec says "Triggers the background ingestion process".
        // For simplicity in Node, we can just call it without awaiting, or await it if we want to return status.
        // If "background", we usually return 202 Accepted.

        shopifyService.syncTenantData(tenantId).catch(err => console.error("Background sync error:", err));

        res.status(202).json({ success: true, message: 'Sync started in background' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
