import React from 'react';

const MetricCard = ({ title, value, prefix = '' }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
                {prefix}{value}
            </div>
        </div>
    );
};

export default MetricCard;
