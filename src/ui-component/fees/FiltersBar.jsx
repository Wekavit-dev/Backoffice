// src/components/fees/FiltersBar.jsx
import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    CurrencyDollarIcon,
    ChevronDownIcon,
    XMarkIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DEFAULT_TRANSACTION_TYPES = [
    { value: 'Withdrawal', label: 'Retrait' },
    { value: 'Deposit', label: 'Dépôt' },
    { value: 'Penalty', label: 'Pénalité' },
    { value: 'Contribution', label: 'Contribution' },
    { value: 'Tontine', label: 'Tontine' }
];

export const FiltersBar = ({
    filters,
    onFilterChange,
    onReset,
    availableDevises = [],
    transactionTypes = DEFAULT_TRANSACTION_TYPES,
    showTransactionType = true,
    showInterval = false,
    interval,
    onIntervalChange,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange({ [key]: value });
    };

    const handleDateChange = (type, value) => {
        const newFilters = { ...localFilters, [type]: value };
        setLocalFilters(newFilters);
        onFilterChange({ [type]: value });
    };

    const hasActiveFilters = () => {
        return Object.keys(localFilters).some(key =>
            localFilters[key] && localFilters[key] !== '' && localFilters[key] !== 'all'
        );
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filtres</h3>
                        {hasActiveFilters() && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                Actifs
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 lg:hidden"
                    >
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters Content */}
            <div className={`p-4 space-y-4 ${!isExpanded ? 'hidden lg:block' : ''}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Devise Selector */}
                    {availableDevises.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Devise
                            </label>
                            <select
                                value={localFilters.idDevise || ''}
                                onChange={(e) => handleChange('idDevise', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                            >
                                <option value="">Toutes les devises</option>
                                {availableDevises.map(devise => (
                                    <option key={devise._id} value={devise._id}>
                                        {devise.unite || devise.nom || 'N/A'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Transaction Type */}
                    {showTransactionType && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type de transaction
                            </label>
                            <select
                                value={localFilters.transactionType || ''}
                                onChange={(e) => handleChange('transactionType', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                            >
                                <option value="">Tous les types</option>
                                {transactionTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Interval Selector */}
                    {showInterval && onIntervalChange && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Intervalle
                            </label>
                            <select
                                value={interval || 'day'}
                                onChange={(e) => onIntervalChange(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                            >
                                <option value="hour">Heure</option>
                                <option value="day">Jour</option>
                                <option value="week">Semaine</option>
                                <option value="month">Mois</option>
                            </select>
                        </div>
                    )}

                    {/* Date Range */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Période
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={localFilters.startDate || ''}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                placeholder="Date début"
                            />
                            <input
                                type="date"
                                value={localFilters.endDate || ''}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                placeholder="Date fin"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                    <button
                        onClick={() => onFilterChange(localFilters)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                    >
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};