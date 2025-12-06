import React, { useEffect, useState } from 'react';
import { getStats, getSalesOverTime, getTopCustomers, syncData, connectStore } from '../services/api';
import MetricCard from '../components/MetricCard';
import SalesChart from '../components/SalesChart';
import TopCustomersTable from '../components/TopCustomersTable';

const Dashboard = () => {
    const [tenantId, setTenantId] = useState(''); // In real app, from auth/context
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mock Login/Connect for MVP
    const [shopDomain, setShopDomain] = useState('my-store.myshopify.com');
    const [accessToken, setAccessToken] = useState('hp_12345'); // Dummy or real

    const handleConnect = async (e) => {
        e.preventDefault();
        try {
            const res = await connectStore({ shopDomain, accessToken });
            const tId = res.data.tenant.id;
            setTenantId(tId);
            // alert('Connected! Tenant ID: ' + tId);
            fetchDashboardData(tId);
        } catch (err) {
            console.error(err);
            setError('Failed to connect store');
        }
    };

    const handleSync = async () => {
        if (!tenantId) return;
        try {
            await syncData(tenantId);
            alert('Sync started in background');
            // Poll or refresh after some time? For now, just wait 2s and refresh
            setTimeout(() => fetchDashboardData(tenantId), 2000);
        } catch (err) {
            console.error(err);
            setError('Failed to sync data');
        }
    };

    const fetchDashboardData = async (tId) => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, salesRes, topRes] = await Promise.all([
                getStats(tId),
                getSalesOverTime(tId),
                getTopCustomers(tId)
            ]);
            setStats(statsRes.data);
            setSalesData(salesRes.data);
            setTopCustomers(topRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (!tenantId) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Connect Shopify Store</h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleConnect}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shop Domain</label>
                                <div className="mt-1">
                                    <input type="text" required value={shopDomain} onChange={(e) => setShopDomain(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Access Token</label>
                                <div className="mt-1">
                                    <input type="text" required value={accessToken} onChange={(e) => setAccessToken(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Connect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <button onClick={handleSync} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                        Sync Data
                    </button>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {error && <div className="mb-4 text-red-600">{error}</div>}
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Metrics */}
                            {stats && (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <MetricCard title="Total Customers" value={stats.totalCustomers} />
                                    <MetricCard title="Total Orders" value={stats.totalOrders} />
                                    <MetricCard title="Total Revenue" value={stats.totalRevenue} prefix="$" />
                                </div>
                            )}

                            {/* Chart */}
                            <SalesChart data={salesData} />

                            {/* Table */}
                            <TopCustomersTable customers={topCustomers} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
