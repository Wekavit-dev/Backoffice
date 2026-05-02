// src/pages/admin/fees/by-devise.jsx
import React, { useState, useContext } from 'react';
import { useFeesData } from '../../hooks/useFeesData';
import { feesAPI } from '../../api/feesAPI';
import { FiltersBar } from '../../ui-component/fees/FiltersBar';
import { BarChartComponent } from '../../ui-component/fees/FeeChart';
import { motion } from 'framer-motion';
import { AppContext } from 'AppContext';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    PercentBadgeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function StatsParDevise() {
    const [metric, setMetric] = useState('totalFees');
    const { globalState } = useContext(AppContext);
    const { data, loading, filters, setFilters, resetFilters, refetch } = useFeesData('getStatsByDevise', {
        startDate: '',
        endDate: ''
    });

    const stats = data?.stats || [];
    const availableDevises = data?.availableDevises || [];
    const selectedDevise = availableDevises.find((devise) => devise._id === filters.idDevise)
        || stats.find((item) => item?.idDevise?._id === filters.idDevise)?.idDevise
        || null;
    const currencyUnit = selectedDevise?.unite || selectedDevise?.nom || '';
    const hasSelectedDevise = Boolean(filters.idDevise);

    const handleExport = () => {
        if (!hasSelectedDevise) {
            toast.error('Veuillez sélectionner une devise avant export.');
            return;
        }
        const exportUrl = feesAPI.getExportUrl(filters, globalState?.key);
        window.open(exportUrl, '_blank');
        toast.success('Export CSV démarré');
    };

    const getMetricLabel = () => {
        switch (metric) {
            case 'totalFees': return 'Frais totaux';
            case 'transactionCount': return 'Nombre de transactions';
            case 'totalOriginalAmount': return 'Montant brut';
            default: return 'Frais totaux';
        }
    };

    const getMetricValue = (item) => {
        switch (metric) {
            case 'totalFees': return item.totalFees || 0;
            case 'transactionCount': return item.transactionCount || 0;
            case 'totalOriginalAmount': return item.totalOriginalAmount || 0;
            default: return item.totalFees || 0;
        }
    };

    const prepareChartData = () => {
        return stats.map(item => ({
            name: item.idDevise?.unite || item.idDevise?.nom || item.devise?.unite || item.devise?.nom || 'N/A',
            value: getMetricValue(item)
        }));
    };

    const totalFees = stats.reduce((sum, item) => sum + (item.totalFees || 0), 0);
    const totalTransactions = stats.reduce((sum, item) => sum + (item.transactionCount || 0), 0);
    const totalOriginalAmount = stats.reduce((sum, item) => sum + (item.totalOriginalAmount || 0), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques par devise</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyse des performances par devise
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Actualiser"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Exporter CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <FiltersBar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                availableDevises={availableDevises}
                showTransactionType={false}
            />

            {!hasSelectedDevise ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-amber-800 dark:text-amber-200">
                    Sélectionnez d&apos;abord une devise pour afficher les données.
                </div>
            ) : (
                <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total des frais</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalFees.toLocaleString('fr-FR')} {currencyUnit}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total des transactions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalTransactions.toLocaleString('fr-FR')}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Montant brut total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalOriginalAmount.toLocaleString('fr-FR')} {currencyUnit}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Metric Selector */}
            <div className="flex justify-end">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                    <button
                        onClick={() => setMetric('totalFees')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${metric === 'totalFees'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Frais totaux
                    </button>
                    <button
                        onClick={() => setMetric('transactionCount')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${metric === 'transactionCount'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setMetric('totalOriginalAmount')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${metric === 'totalOriginalAmount'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Montant brut
                    </button>
                </div>
            </div>

            {/* Bar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
            >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    {getMetricLabel()} par devise
                </h3>
                <BarChartComponent
                    data={prepareChartData()}
                    dataKey="value"
                    nameKey="name"
                    height={350}
                    valueSuffix={metric !== 'transactionCount' && currencyUnit ? ` ${currencyUnit}` : ''}
                    barColor="#3B82F6"
                />
            </motion.div>

            {/* Comparison Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Comparaison par devise</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Devise
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Frais totaux
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Transactions
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Montant brut
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    % moyen
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    % du total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Aucune donnée disponible
                                    </td>
                                </tr>
                            ) : (
                                stats.map((item, index) => {
                                    const percentage = (item.totalFees / totalFees) * 100;
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${index % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-green-500 to-emerald-600'} flex items-center justify-center shadow-sm`}>
                                                        <CurrencyDollarIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.idDevise?.nom || item.devise?.nom || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{item.idDevise?.unite || item.devise?.unite || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {item.totalFees?.toLocaleString('fr-FR') || 0} {currencyUnit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                                {item.transactionCount?.toLocaleString('fr-FR') || 0}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                                {item.totalOriginalAmount?.toLocaleString('fr-FR') || 0} {currencyUnit}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                                {item.averagePercentage?.toFixed(2) || 0}%
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
                </>
            )}
        </div>
    );
}