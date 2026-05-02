// src/components/fees/KPICards.jsx
import React from 'react';
import {
    BanknotesIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PercentBadgeIcon,
    TrendingUpIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const formatCurrency = (value, compact = false) => {
    if (value === undefined || value === null) return '0';
    if (compact && Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const KPI_CARDS = [
    {
        key: 'totalFees',
        label: 'Total des frais',
        icon: BanknotesIcon,
        color: 'from-blue-500 to-indigo-600',
        format: 'currency'
    },
    {
        key: 'totalTransactions',
        label: 'Transactions',
        icon: DocumentTextIcon,
        color: 'from-green-500 to-emerald-600',
        format: 'number'
    },
    {
        key: 'averageFee',
        label: 'Frais moyen',
        icon: ChartBarIcon,
        color: 'from-purple-500 to-pink-600',
        format: 'currency'
    },
    {
        key: 'averagePercentage',
        label: 'Taux moyen',
        icon: PercentBadgeIcon,
        color: 'from-orange-500 to-red-600',
        suffix: '%',
        format: 'percentage'
    }
];

export const KPICards = ({ data, loading, currencyUnit = '' }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const summary = data?.summary || {};

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CARDS.map((card, index) => {
                const value = summary[card.key] || 0;
                let displayValue = value;

                if (card.format === 'currency') {
                    displayValue = formatCurrency(value);
                } else if (card.format === 'percentage') {
                    displayValue = value.toFixed(2);
                } else {
                    displayValue = value.toLocaleString('fr-FR');
                }

                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {displayValue}
                                    {card.format === 'currency' && currencyUnit && <span className="text-sm font-normal ml-1">{currencyUnit}</span>}
                                    {card.suffix && <span className="text-sm font-normal ml-1">{card.suffix}</span>}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};