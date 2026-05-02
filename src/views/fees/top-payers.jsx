// src/pages/admin/fees/top-payers.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useFeesData } from '../../hooks/useFeesData';
import { feesAPI } from '../../api/feesAPI';
import { FiltersBar } from '../../ui-component/fees/FiltersBar';
import { motion } from 'framer-motion';
import { AppContext } from 'AppContext';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    TrophyIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    BanknotesIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const getMedalColor = (position) => {
    switch (position) {
        case 1: return 'from-yellow-400 to-yellow-600';
        case 2: return 'from-gray-400 to-gray-600';
        case 3: return 'from-amber-600 to-amber-800';
        default: return 'from-blue-400 to-blue-600';
    }
};

const getMedalEmoji = (position) => {
    switch (position) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `${position}`;
    }
};

export default function TopPayeurs() {
    const [limit, setLimit] = useState(10);
    const [availableDevises, setAvailableDevises] = useState([]);
    const { globalState } = useContext(AppContext);
    const { data, loading, filters, setFilters, resetFilters, refetch } = useFeesData('getTopPayers', {
        startDate: '',
        endDate: '',
        idDevise: '',
        limit: 10
    });

    useEffect(() => {
        if (globalState?.key) {
            loadDevises();
        }
    }, [globalState?.key]);

    useEffect(() => {
        setFilters({ limit }, false);
    }, [limit]);

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
        const exportUrl = feesAPI.getExportUrl({ ...filters, limit }, globalState?.key);
        window.open(exportUrl, '_blank');
        toast.success('Export CSV démarré');
    };

    const topPayers = data?.topPayers || [];
    const summary = data?.summary || {};
    const selectedDevise = summary?.byDevise?.find((item) => item?.idDevise?._id === filters.idDevise)?.idDevise
        || availableDevises.find((devise) => devise._id === filters.idDevise)
        || topPayers?.[0]?.idDevise
        || null;
    const currencyUnit = selectedDevise?.unite || selectedDevise?.nom || '';
    const hasSelectedDevise = Boolean(filters.idDevise);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Top contributeurs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Les utilisateurs qui paient le plus de frais
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
            />

            {!hasSelectedDevise ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-amber-800 dark:text-amber-200">
                    Sélectionnez d&apos;abord une devise pour afficher les statistiques.
                </div>
            ) : (
                <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-100">Total des frais collectés</p>
                            <p className="text-2xl font-bold mt-1">
                                {summary.totalFeesCollected?.toLocaleString('fr-FR') || 0} {currencyUnit}
                            </p>
                        </div>
                        <BanknotesIcon className="w-10 h-10 text-blue-200" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-100">Nombre total de payeurs</p>
                            <p className="text-2xl font-bold mt-1">{summary.totalPayers || 0}</p>
                        </div>
                        <UserIcon className="w-10 h-10 text-green-200" />
                    </div>
                </motion.div>
            </div>

            {/* Limit Selector */}
            <div className="flex justify-end">
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                >
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                </select>
            </div>

            {/* Leaderboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                                    Rang
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total frais
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Transactions
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Frais moyen
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Dernière activité
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
                            ) : topPayers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Aucune donnée disponible
                                    </td>
                                </tr>
                            ) : (
                                topPayers.map((payer, index) => {
                                    const position = index + 1;
                                    const user = payer.user || {};
                                    return (
                                        <tr key={user._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(position)} text-white font-bold text-sm shadow-md`}>
                                                    {getMedalEmoji(position)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.nom} {user.prenom}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <EnvelopeIcon className="w-3 h-3" />
                                                            {user.email || '-'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <PhoneIcon className="w-3 h-3" />
                                                            {user.phone || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {payer.totalFeesPaid?.toLocaleString('fr-FR') || 0} {currencyUnit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {payer.totalTransactions || 0}
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {payer.averageFeePerTransaction?.toLocaleString('fr-FR') || 0} {currencyUnit}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(payer.lastTransaction)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Percentage of total */}
            {summary.totalFeesCollected > 0 && topPayers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                    Le top {topPayers.length} représente{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {((topPayers.reduce((sum, p) => sum + (p.totalFeesPaid || 0), 0) / summary.totalFeesCollected) * 100).toFixed(1)}%
                    </span>{' '}
                    du total des frais collectés
                </motion.div>
            )}
                </>
            )}
        </div>
    );
}