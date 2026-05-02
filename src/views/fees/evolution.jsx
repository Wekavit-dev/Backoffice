// src/pages/admin/fees/evolution.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useFeesData } from '../../hooks/useFeesData';
import { feesAPI } from '../../api/feesAPI';
import { FiltersBar } from '../../ui-component/fees/FiltersBar';
import { LineChartComponent } from '../../ui-component/fees/FeeChart';
import { motion } from 'framer-motion';
import { AppContext } from 'AppContext';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function EvolutionFrais() {
    const [interval, setInterval] = useState('day');
    const [availableDevises, setAvailableDevises] = useState([]);
    const { globalState } = useContext(AppContext);
    const { data, loading, filters, setFilters, resetFilters, refetch } = useFeesData('getTimeline', {
        startDate: '',
        endDate: '',
        idDevise: '',
        interval: 'day'
    });

    useEffect(() => {
        if (globalState?.key) {
            loadDevises();
        }
    }, [globalState?.key]);

    useEffect(() => {
        setFilters({ interval }, false);
    }, [interval]);

    const loadDevises = async () => {
        try {
            const result = await feesAPI.getStatsByDevise({}, globalState?.key);
            if (result.data?.success && result.data?.data?.availableDevises) {
                setAvailableDevises(result.data.data.availableDevises);
            }
        } catch (error) {
            console.error('Error loading devises:', error);
        }
    };

    const handleExport = () => {
        if (!filters.idDevise) {
            toast.error('Veuillez sélectionner une devise avant export.');
            return;
        }
        const exportUrl = feesAPI.getExportUrl({ ...filters, interval }, globalState?.key);
        window.open(exportUrl, '_blank');
        toast.success('Export CSV démarré');
    };

    const prepareChartData = () => {
        const timeline = data || [];

        // Grouper par devise si plusieurs devises
        const deviseMap = new Map();
        timeline.forEach(item => {
            const deviseCode = item.idDevise?.unite || item.idDevise?.nom || item.devise?.unite || item.devise?.nom || 'Toutes';
            if (!deviseMap.has(deviseCode)) {
                deviseMap.set(deviseCode, []);
            }
            deviseMap.get(deviseCode).push({
                period: formatPeriod(item.period, interval),
                totalFees: item.totalFees,
                transactionCount: item.transactionCount,
                averageFee: item.averageFee
            });
        });

        // Si une seule devise ou pas de devise spécifiée, retourner les données directes
        if (deviseMap.size <= 1) {
            return {
                lines: [{ dataKey: 'totalFees', name: 'Frais totaux', color: '#3B82F6' }],
                data: timeline.map(item => ({
                    period: formatPeriod(item.period, interval),
                    totalFees: item.totalFees,
                    transactionCount: item.transactionCount,
                    averageFee: item.averageFee
                }))
            };
        }

        // Multi-devises: créer des courbes séparées
        const lines = [];
        const allData = [];
        const periods = new Set();

        deviseMap.forEach((values, devise) => {
            lines.push({ dataKey: devise, name: devise, color: getDeviseColor(devise) });
            values.forEach(v => periods.add(v.period));
        });

        Array.from(periods).sort().forEach(period => {
            const dataPoint = { period };
            deviseMap.forEach((values, devise) => {
                const match = values.find(v => v.period === period);
                dataPoint[devise] = match?.totalFees || 0;
            });
            allData.push(dataPoint);
        });

        return { lines, data: allData };
    };

    const formatPeriod = (period, intervalType) => {
        if (!period) return '';
        const date = new Date(period);
        switch (intervalType) {
            case 'hour':
                return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            case 'day':
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            case 'week':
                return `Semaine ${Math.ceil(date.getDate() / 7)}`;
            case 'month':
                return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            default:
                return date.toLocaleDateString('fr-FR');
        }
    };

    const getDeviseColor = (devise) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
        const index = devise.length % colors.length;
        return colors[index];
    };

    const calculateStats = () => {
        const timeline = data || [];
        if (!timeline.length) return null;

        const totalFees = timeline.reduce((sum, item) => sum + (item.totalFees || 0), 0);
        const avgDailyFees = totalFees / timeline.length;
        const maxFees = Math.max(...timeline.map(item => item.totalFees || 0));
        const trend = timeline.length > 1 ?
            ((timeline[timeline.length - 1]?.totalFees || 0) - (timeline[0]?.totalFees || 0)) : 0;

        return { totalFees, avgDailyFees, maxFees, trend };
    };

    const stats = calculateStats();
    const { lines, data: chartData } = prepareChartData();
    const selectedDevise = availableDevises.find((devise) => devise._id === filters.idDevise) || data?.[0]?.idDevise || null;
    const currencyUnit = selectedDevise?.unite || selectedDevise?.nom || '';
    const hasSelectedDevise = Boolean(filters.idDevise);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse temporelle</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Évolution des frais collectés dans le temps
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
                showTransactionType={true}
                showInterval={true}
                interval={interval}
                onIntervalChange={setInterval}
            />

            {!hasSelectedDevise ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-amber-800 dark:text-amber-200">
                    Sélectionnez d&apos;abord une devise pour afficher les statistiques.
                </div>
            ) : (
                <>
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total des frais</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalFees.toLocaleString('fr-FR')} {currencyUnit}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne par période</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stats.avgDailyFees.toLocaleString('fr-FR')} {currencyUnit}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pic maximum</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stats.maxFees.toLocaleString('fr-FR')} {currencyUnit}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tendance</p>
                                <p className={`text-xl font-bold flex items-center gap-1 ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.trend >= 0 ? '+' : ''}{stats.trend.toLocaleString('fr-FR')} {currencyUnit}
                                    {stats.trend >= 0 ?
                                        <ArrowTrendingUpIcon className="w-4 h-4" /> :
                                        <ArrowTrendingDownIcon className="w-4 h-4" />
                                    }
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                {stats.trend >= 0 ?
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" /> :
                                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                                }
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
            >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Évolution des frais {interval === 'hour' ? 'par heure' : interval === 'day' ? 'par jour' : interval === 'week' ? 'par semaine' : 'par mois'}
                </h3>
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <LineChartComponent
                        data={chartData}
                        lines={lines}
                        height={400}
                        xAxisKey="period"
                        valueSuffix={currencyUnit ? ` ${currencyUnit}` : ''}
                    />
                )}
            </motion.div>

            {/* Summary Table */}
            {chartData.length > 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Détail par période</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Période
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Frais collectés
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Transactions
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Frais moyen
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {chartData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.period}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                                            {Object.keys(item).filter(k => k !== 'period').reduce((sum, key) => sum + (item[key] || 0), 0).toLocaleString('fr-FR')} {currencyUnit}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {item.transactionCount?.toLocaleString('fr-FR') || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {item.averageFee ? `${item.averageFee.toLocaleString('fr-FR')} ${currencyUnit}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
                </>
            )}
        </div>
    );
}