import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowPathIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ArrowTrendingUpIcon as TrendingUpIcon,
    ArrowTrendingDownIcon as TrendingDownIcon,
    MinusIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useAccountingLightData } from 'hooks/useAccountingLightData';
import { LightFiltersBar } from 'ui-component/accounting/LightFiltersBar';

const formatNumber = (value) => {
    const num = Number(value || 0);
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const statusBadgeClass = (status) => {
    if (status === 'green') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'red') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const trendIcon = (trend) => {
    if (trend === 'up') return <TrendingUpIcon className="h-4 w-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
};

// Composant KPI Card
const KPICard = ({ title, value, icon: Icon, iconColor, loading, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-700/20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                {loading ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                )}
            </div>
            <div className={`rounded-xl p-2 bg-opacity-10 ${iconColor}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
        </div>
    </motion.div>
);

// Composant de skeleton pour le tableau
const TableSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ))}
    </div>
);

// Composant de ligne du tableau
const TableRow = ({ item, index }) => {
    const [expanded, setExpanded] = useState(false);
    const current = item?.period?.current || {};
    const evolution = item?.period?.evolution || {};

    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        {expanded ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item?.idDevise?.nom || '-'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item?.idDevise?.unite || '-'}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{formatNumber(current.feesCollected)}</td>
                <td className="px-4 py-4 text-right text-sm text-gray-700 dark:text-gray-300">{formatNumber(current.interestCost)}</td>
                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(current.netResult)}</td>
                <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                        {item.status === 'green' ? 'Gain' : item.status === 'red' ? 'Perte' : 'Neutre'}
                    </span>
                </td>
                <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                        {trendIcon(evolution.trend)}
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatNumber(evolution.netResultDelta)}</span>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <p className="font-medium text-gray-700 dark:text-gray-300">Période actuelle</p>
                                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                    <p>Fees: {formatNumber(current.feesCollected)}</p>
                                    <p>Coût intérêts: {formatNumber(current.interestCost)}</p>
                                    <p>Résultat: {formatNumber(current.netResult)}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-gray-700 dark:text-gray-300">Évolution</p>
                                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                    <p>Delta fees: {formatNumber(evolution.feesDelta)}</p>
                                    <p>Delta coût: {formatNumber(evolution.interestCostDelta)}</p>
                                    <p>Tendance: {evolution.trend || 'stable'}</p>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default function AccountingLight() {
    const [showDetails, setShowDetails] = useState(false);
    const { data, loading, error, filters, setFilters, resetFilters, refetch } = useAccountingLightData({
        period: 'month',
        startDate: '',
        endDate: '',
        idDevise: ''
    });

    const summary = data?.summary || {};
    const meta = data?.meta || {};
    const byDevise = useMemo(() => data?.byDevise || [], [data?.byDevise]);

    const availableDevises = useMemo(
        () => byDevise.map((item) => item?.idDevise).filter((value) => value && value._id),
        [byDevise]
    );

    const emptyState = !loading && !error && !summary?.netResult && byDevise.length === 0;
    const netResult = Number(summary.netResult || 0);
    const isPositive = netResult > 0;
    const isNegative = netResult < 0;

    return (
        <div className="min-h-screen bg-transparent dark:bg-gray-900">
            <div className="space-y-6 p-6 max-w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comptabilité light</h1>
                            {!loading && summary.status && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(summary.status)}`}>
                                    {summary.status === 'green' ? 'Bénéficiaire' : summary.status === 'red' ? 'Déficitaire' : 'Équilibré'}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Résultat net = Fees collectés - Coût des intérêts (pilotage comptable)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <EyeIcon className="h-4 w-4" />
                            {showDetails ? 'Masquer détails' : 'Afficher détails'}
                        </button>
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <LightFiltersBar
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={resetFilters}
                    availableDevises={availableDevises}
                    loading={loading}
                />

                {/* Période info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Période actuelle:</span> {formatDate(meta?.currentRange?.start)} - {formatDate(meta?.currentRange?.end)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Période précédente:</span> {formatDate(meta?.previousRange?.start)} - {formatDate(meta?.previousRange?.end)}
                            </p>
                        </div>
                        {meta?.accountingRule && (
                            <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-1.5">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{meta.accountingRule}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Error state */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="font-medium text-red-800 dark:text-red-300">Erreur de chargement</p>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                                <button
                                    onClick={refetch}
                                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Réessayer
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!error && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KPICard
                                title="Résultat net"
                                value={`${isPositive ? '+' : ''}${formatNumber(netResult)}`}
                                icon={ChartBarIcon}
                                iconColor={isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-gray-500'}
                                loading={loading}
                                delay={0.1}
                            />
                            <KPICard
                                title="Fees collectés"
                                value={formatNumber(summary.totalFeesCollected)}
                                icon={CurrencyDollarIcon}
                                iconColor="text-emerald-500"
                                loading={loading}
                                delay={0.2}
                            />
                            <KPICard
                                title="Coût des intérêts"
                                value={formatNumber(summary.totalInterestCost)}
                                icon={DocumentTextIcon}
                                iconColor="text-amber-500"
                                loading={loading}
                                delay={0.3}
                            />
                            <KPICard
                                title="Marge nette"
                                value={summary.netMargin ? `${summary.netMargin}%` : '-'}
                                icon={TrendingUpIcon}
                                iconColor="text-blue-500"
                                loading={loading}
                                delay={0.4}
                            />
                        </div>

                        {/* Détails supplémentaires (conditionnel) */}
                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                                >
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Gain total</p>
                                        <p className="mt-1 text-xl font-semibold text-emerald-700 dark:text-emerald-400">{formatNumber(summary.gainAmount)}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Perte totale</p>
                                        <p className="mt-1 text-xl font-semibold text-red-700 dark:text-red-400">{formatNumber(summary.lossAmount)}</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Évolution nette</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {trendIcon(summary?.netEvolution?.trend)}
                                            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatNumber(summary?.netEvolution?.delta)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tableau par devise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                        >
                            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Analyse par devise</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Détail des performances par devise</p>
                            </div>
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="p-4">
                                        <TableSkeleton />
                                    </div>
                                ) : byDevise.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Aucune donnée disponible sur la période sélectionnée</p>
                                    </div>
                                ) : (
                                    <table className="w-full min-w-[860px]">
                                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Devise</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fees collectés</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Coût intérêts</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Résultat net</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Évolution</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {byDevise.map((item, idx) => (
                                                <TableRow key={item?.idDevise?._id || idx} item={item} index={idx} />
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>

                        {/* Empty state */}
                        <AnimatePresence>
                            {emptyState && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 p-8 text-center"
                                >
                                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                    <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible sur la période sélectionnée</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Modifiez les filtres pour afficher des résultats</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}