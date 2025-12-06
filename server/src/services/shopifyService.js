const axios = require('axios');
const prisma = require('../config/db');

/**
 * Service to handle Shopify Data Ingestion
 */
class ShopifyService {
    /**
     * Connect a new store (Tenant)
     * @param {string} shopDomain 
     * @param {string} accessToken 
     */
    async connectStore(shopDomain, accessToken) {
        if (!shopDomain || !accessToken) {
            throw new Error('Shop Domain and Access Token are required');
        }

        // Upsert Tenant (Update token if exists)
        const tenant = await prisma.tenant.upsert({
            where: { shopDomain },
            update: { accessToken },
            create: { shopDomain, accessToken }
        });

        return tenant;
    }

    /**
     * Sync data for a tenant
     * @param {string} tenantId 
     */
    async syncTenantData(tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error('Tenant not found');

        const { shopDomain, accessToken } = tenant;
        const shopifyApi = axios.create({
            baseURL: `https://${shopDomain}/admin/api/2023-10`,
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        // 1. Sync Customers
        await this.syncCustomers(tenantId, shopifyApi);

        // 2. Sync Products
        await this.syncProducts(tenantId, shopifyApi);

        // 3. Sync Orders
        await this.syncOrders(tenantId, shopifyApi);

        return { status: 'success', message: 'Sync completed' };
    }

    async syncCustomers(tenantId, shopifyApi) {
        try {
            const response = await shopifyApi.get('/customers.json?limit=250');
            const customers = response.data.customers;

            for (const cust of customers) {
                await prisma.customer.upsert({
                    where: { shopifyCustomerId: cust.id.toString() }, // Ensure string
                    update: {
                        email: cust.email,
                        firstName: cust.first_name,
                        lastName: cust.last_name,
                        totalSpent: parseFloat(cust.total_spent || 0),
                        ordersCount: cust.orders_count || 0,
                        tenantId: tenantId // Ensure tenant isolation if unique constraint allowed strict isolation, but here unique is global for shopifyCustomerId? 
                        // NOTE: Ideally shopifyCustomerId should be unique PER TENANT, but schema has global unique. Assuming IDs are globally unique across Shopify (they are).
                    },
                    create: {
                        shopifyCustomerId: cust.id.toString(),
                        email: cust.email,
                        firstName: cust.first_name,
                        lastName: cust.last_name,
                        totalSpent: parseFloat(cust.total_spent || 0),
                        ordersCount: cust.orders_count || 0,
                        tenantId: tenantId
                    }
                });
            }
            console.log(`Synced ${customers.length} customers for ${tenantId}`);
        } catch (error) {
            console.error('Error syncing customers:', error.message);
        }
    }

    async syncProducts(tenantId, shopifyApi) {
        try {
            const response = await shopifyApi.get('/products.json?limit=250');
            const products = response.data.products;

            for (const prod of products) {
                await prisma.product.upsert({
                    where: { shopifyProductId: prod.id.toString() },
                    update: {
                        title: prod.title,
                        vendor: prod.vendor,
                        tenantId: tenantId
                    },
                    create: {
                        shopifyProductId: prod.id.toString(),
                        title: prod.title,
                        vendor: prod.vendor,
                        tenantId: tenantId
                    }
                });
            }
            console.log(`Synced ${products.length} products for ${tenantId}`);
        } catch (error) {
            console.error('Error syncing products:', error.message);
        }
    }

    async syncOrders(tenantId, shopifyApi) {
        try {
            const response = await shopifyApi.get('/orders.json?status=any&limit=250');
            const orders = response.data.orders;

            for (const order of orders) {
                // Find local customer ID if exists
                let localCustomerId = null;
                if (order.customer) {
                    const customer = await prisma.customer.findUnique({
                        where: { shopifyCustomerId: order.customer.id.toString() }
                    });
                    if (customer) localCustomerId = customer.id;
                }

                await prisma.order.upsert({
                    where: { shopifyOrderId: order.id.toString() },
                    update: {
                        orderNumber: order.order_number,
                        totalPrice: parseFloat(order.total_price),
                        currency: order.currency,
                        createdAt: new Date(order.created_at),
                        tenantId: tenantId,
                        customerId: localCustomerId
                    },
                    create: {
                        shopifyOrderId: order.id.toString(),
                        orderNumber: order.order_number,
                        totalPrice: parseFloat(order.total_price),
                        currency: order.currency,
                        createdAt: new Date(order.created_at),
                        tenantId: tenantId,
                        customerId: localCustomerId
                    }
                });
            }
            console.log(`Synced ${orders.length} orders for ${tenantId}`);
        } catch (error) {
            console.error('Error syncing orders:', error.message);
        }
    }
}

module.exports = new ShopifyService();
