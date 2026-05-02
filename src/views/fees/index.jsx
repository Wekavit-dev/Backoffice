// src/pages/admin/fees/index.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useFeesData } from '../../hooks/useFeesData';
import { feesAPI } from '../../api/feesAPI';
import { FiltersBar } from '../../ui-component/fees/FiltersBar';
import { KPICards } from '../../ui-component/fees/KPICards';
import { BarChartComponent, PieChartComponent, LineChartComponent } from '../../ui-component/fees/FeeChart';
import { motion } from 'framer-motion';
import { AppContext } from 'AppContext';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function FeesDashboard() {
    const { globalState } = useContext(AppContext);
    const { data, loading, filters, setFilters, resetFilters, refetch } = useFeesData('getDashboard', {
        startDate: '',
        endDate: '',
        idDevise: ''
    });

    const [availableDevises, setAvailableDevises] = useState([]);
    const [loadingDevises, setLoadingDevises] = useState(true);
    const hasSelectedDevise = Boolean(filters.idDevise);
    const selectedDevise = data?.selectedDevise || availableDevises.find((devise) => devise._id === filters.idDevise) || null;
    const currencyUnit = selectedDevise?.unite || selectedDevise?.nom || '';

    useEffect(() => {
        if (globalState?.key) {
            loadDevises();
        }
    }, [globalState?.key]);

    const loadDevises = async () => {
        try {
            const result = await feesAPI.getStatsByDevise({}, globalState?.key);
            if (result.data?.success && result.data?.data?.availableDevises) {
                setAvailableDevises(result.data.data.availableDevises);
            }
        } catch (error) {
            console.error('Error loading devises:', error);
        } finally {
            setLoadingDevises(false);
        }
    };

    const handleExport = () => {
        if (!hasSelectedDevise) {
            toast.error('Veuillez sélectionner une devise avant export.');
            return;
        }
        const exportUrl = feesAPI.getExportUrl(filters, globalState?.key);
        window.open(exportUrl, '_blank');
        toast.success('Export CSV démarré');
    };

    const prepareChartData = () => {
        const byDevise = data?.byDevise || [];
        return byDevise.map(item => ({
            name: item.idDevise?.unite || item.idDevise?.nom || item.devise?.unite || item.devise?.nom || 'N/A',
            totalFees: item.totalFees,
            transactionCount: item.transactionCount
        }));
    };

    const preparePieData = () => {
        const byType = data?.byTransactionType || [];
        return byType.map(item => ({
            label: item.transactionType,
            totalFees: item.totalFees,
            transactionCount: item.transactionCount
        }));
    };

    const prepareTimelineData = () => {
        const timeline = data?.last7Days || [];
        return timeline.map(item => ({
            date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            totalFees: item.totalFees,
            transactionCount: item.transactionCount
        }));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques des frais</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Vue d'ensemble des frais collectés et indicateurs clés
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
                    Sélectionnez d&apos;abord une devise pour afficher les statistiques.
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <KPICards data={data} loading={loading} currencyUnit={currencyUnit} />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Frais par devise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Frais par devise</h3>
                            </div>
                            <BarChartComponent
                                data={prepareChartData()}
                                dataKey="totalFees"
                                nameKey="name"
                                height={300}
                                valueSuffix={currencyUnit ? ` ${currencyUnit}` : ''}
                                barColor="#3B82F6"
                            />
                        </motion.div>

                        {/* Répartition par type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Répartition par type</h3>
                            <PieChartComponent
                                data={preparePieData()}
                                dataKey="totalFees"
                                nameKey="label"
                                height={300}
                            />
                        </motion.div>

                        {/* Évolution 7 jours */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Évolution des frais - 7 derniers jours</h3>
                            <LineChartComponent
                                data={prepareTimelineData()}
                                lines={[
                                    { dataKey: 'totalFees', name: 'Frais totaux', color: '#3B82F6' },
                                    { dataKey: 'transactionCount', name: 'Transactions', color: '#10B981' }
                                ]}
                                height={300}
                                xAxisKey="date"
                                valueSuffix={currencyUnit ? ` ${currencyUnit}` : ''}
                            />
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
}