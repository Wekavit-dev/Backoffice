// src/pages/admin/fees/transactions.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useFeesData } from '../../hooks/useFeesData';
import { feesAPI } from '../../api/feesAPI';
import { FiltersBar } from '../../ui-component/fees/FiltersBar';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from 'AppContext';
import {
    ArrowPathIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const transactionLabels = {
    Withdrawal: 'Retrait',
    Deposit: 'Dépôt',
    Penalty: 'Pénalité',
    Contribution: 'Contribution',
    Tontine: 'Tontine'
};

const getTransactionTypeColor = (type) => {
    const colors = {
        Withdrawal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        Deposit: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        Penalty: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        Contribution: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        Tontine: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function TransactionsFrais() {
    const [page, setPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [availableDevises, setAvailableDevises] = useState([]);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const { globalState } = useContext(AppContext);

    const { data, loading, filters, setFilters, resetFilters, refetch } = useFeesData('getTransactions', {
        page: 1,
        limit: 20,
        startDate: '',
        endDate: '',
        idDevise: '',
        transactionType: '',
        search: ''
    });

    useEffect(() => {
        const fetchOptions = async () => {
            if (!globalState?.key) return;
            try {
                const [devisesResult, typesResult] = await Promise.all([
                    feesAPI.getStatsByDevise({}, globalState?.key),
                    feesAPI.getTransactionTypes(globalState?.key)
                ]);

                if (devisesResult.data?.success && devisesResult.data?.data?.availableDevises) {
                    setAvailableDevises(devisesResult.data.data.availableDevises);
                }

                if (typesResult.data?.success && Array.isArray(typesResult.data?.data)) {
                    setTransactionTypes(typesResult.data.data);
                }
            } catch (error) {
                console.error('Error loading fees options:', error);
            }
        };

        fetchOptions();
    }, [globalState?.key]);

    useEffect(() => {
        setFilters({ page }, false);
    }, [page, setFilters]);

    const handleSearch = () => {
        setFilters({ search: searchInput, page: 1 });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleExport = () => {
        if (!filters.idDevise) {
            toast.error('Veuillez sélectionner une devise avant export.');
            return;
        }
        const exportUrl = feesAPI.getExportUrl({ ...filters, page, limit: 999999 }, globalState?.key);
        window.open(exportUrl, '_blank');
        toast.success('Export CSV démarré');
    };

    const transactions = data?.transactions || [];
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };
    const summary = data?.summary || {};
    const selectedDevise = summary?.byDevise?.find((item) => item?.idDevise?._id === filters.idDevise)?.idDevise
        || availableDevises.find((devise) => devise._id === filters.idDevise)
        || transactions?.[0]?.idDevise
        || null;
    const currencyUnit = selectedDevise?.unite || selectedDevise?.nom || '';
    const hasSelectedDevise = Boolean(filters.idDevise);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions de frais</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consultez et recherchez toutes les transactions avec frais
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

            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Rechercher par nom, prénom ou email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                    Rechercher
                </button>
            </div>

            {/* Filters */}
            <FiltersBar
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => {
                    resetFilters();
                    setSearchInput('');
                    setPage(1);
                }}
                availableDevises={availableDevises}
                transactionTypes={transactionTypes}
                showTransactionType={true}
            />

            {!hasSelectedDevise ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-amber-800 dark:text-amber-200">
                    Sélectionnez d&apos;abord une devise pour afficher les données.
                </div>
            ) : (
                <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total des frais</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {summary.totalFees?.toLocaleString('fr-FR') || 0} {currencyUnit}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Montant brut</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {summary.totalOriginalAmount?.toLocaleString('fr-FR') || 0} {currencyUnit}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Montant net</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {summary.totalNetAmount?.toLocaleString('fr-FR') || 0} {currencyUnit}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Frais moyen</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {summary.averageFee?.toLocaleString('fr-FR') || 0} {currencyUnit}
                    </p>
                </div>
            </div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Devise
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Montant brut
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    % frais
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Frais
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Montant net
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        Aucune transaction trouvée
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {formatDate(transaction.collectedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {transaction.idUser?.nom} {transaction.idUser?.prenom}
                                            </p>
                                            <p className="text-xs text-gray-500">{transaction.idUser?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {transaction.idDevise?.unite || transaction.idDevise?.nom || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.transactionType)}`}>
                                                {transactionLabels[transaction.transactionType] || transaction.transactionType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                            {transaction.originalAmount?.toLocaleString('fr-FR') || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                            {transaction.feePercentage || 0}%
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                {transaction.feeAmount?.toLocaleString('fr-FR') || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                            {transaction.netAmount?.toLocaleString('fr-FR') || 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedTransaction(transaction)}
                                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Voir détails"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page {pagination.page} sur {pagination.pages} ({pagination.total} transactions)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Transaction Details Modal */}
            <AnimatePresence>
                {selectedTransaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedTransaction(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de la transaction</h3>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatDate(selectedTransaction.collectedAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Type de transaction</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {transactionLabels[selectedTransaction.transactionType] || selectedTransaction.transactionType}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Utilisateur</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedTransaction.idUser?.nom} {selectedTransaction.idUser?.prenom}
                                        </p>
                                        <p className="text-xs text-gray-500">{selectedTransaction.idUser?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Devise</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedTransaction.idDevise?.nom || '-'} ({selectedTransaction.idDevise?.unite || '-'})
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Montant original</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedTransaction.originalAmount?.toLocaleString('fr-FR')} {currencyUnit}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Pourcentage des frais</label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {selectedTransaction.feePercentage}%
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Montant des frais</label>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                            {selectedTransaction.feeAmount?.toLocaleString('fr-FR')} {currencyUnit}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Montant net</label>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {selectedTransaction.netAmount?.toLocaleString('fr-FR')} {currencyUnit}
                                        </p>
                                    </div>
                                </div>
                                {selectedTransaction.idTarification && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Détails de la tarification</label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {selectedTransaction.idTarification?.details || '-'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
                </>
            )}
        </div>
    );
}