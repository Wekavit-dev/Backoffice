import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Filter,
    RotateCcw,
    RefreshCw,
    ChevronDown,
    X,
    Check
} from 'lucide-react';

const PERIOD_OPTIONS = [
    { value: 'day', label: 'Jour', icon: '📅' },
    { value: 'week', label: 'Semaine', icon: '📆' },
    { value: 'month', label: 'Mois', icon: '📊' },
    { value: 'year', label: 'Année', icon: '📈' }
];

export function LightFiltersBar({
    filters,
    onFilterChange,
    onReset,
    availableDevises = [],
    loading = false,
    compact = false,
    showPeriodSelector = true,
    showDateRange = true,
    showDeviseSelector = true
}) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    useEffect(() => {
        const count = [
            localFilters.period && localFilters.period !== 'month',
            localFilters.startDate,
            localFilters.endDate,
            localFilters.idDevise
        ].filter(Boolean).length;
        setActiveFiltersCount(count);
    }, [localFilters]);

    const handleInputChange = useCallback((field, value) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleApply = useCallback(() => {
        onFilterChange(localFilters);
    }, [localFilters, onFilterChange]);

    const handleReset = useCallback(() => {
        const defaultFilters = {
            period: 'month',
            startDate: '',
            endDate: '',
            idDevise: ''
        };
        setLocalFilters(defaultFilters);
        onReset();
    }, [onReset]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    }, [handleApply]);

    const removeFilter = useCallback((filterName) => {
        setLocalFilters((prev) => ({ ...prev, [filterName]: '' }));
    }, []);

    const selectedPeriod = PERIOD_OPTIONS.find(p => p.value === localFilters.period);
    const selectedDevise = availableDevises.find(d => d._id === localFilters.idDevise);
    const hasActiveFilters = activeFiltersCount > 0;

    return (
        <div
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-all duration-200"
            onKeyPress={handleKeyPress}
        >
            {/* Header avec titre et compteur */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres avancés</span>
                        {hasActiveFilters && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    {compact && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {(!compact || isExpanded) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-4 space-y-4">
                            {/* Grille des filtres */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* Sélecteur de période */}
                                {showPeriodSelector && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                            Période
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={localFilters.period || 'month'}
                                                onChange={(e) => handleInputChange('period', e.target.value)}
                                                className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                            >
                                                {PERIOD_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.icon} {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* Date début */}
                                {showDateRange && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Date début
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            value={localFilters.startDate || ''}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Date fin */}
                                {showDateRange && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Date fin
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            value={localFilters.endDate || ''}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Sélecteur de devise */}
                                {showDeviseSelector && availableDevises.length > 0 && (
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                            Devise
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={localFilters.idDevise || ''}
                                                onChange={(e) => handleInputChange('idDevise', e.target.value)}
                                                className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                            >
                                                <option value="">Toutes les devises</option>
                                                {availableDevises.map((devise) => (
                                                    <option key={devise._id} value={devise._id}>
                                                        {devise.nom} ({devise.code || devise.unite})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tags des filtres actifs */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                    {localFilters.period && localFilters.period !== 'month' && selectedPeriod && (
                                        <FilterTag
                                            label={`Période: ${selectedPeriod.label}`}
                                            onRemove={() => removeFilter('period')}
                                        />
                                    )}
                                    {localFilters.startDate && (
                                        <FilterTag
                                            label={`Du: ${new Date(localFilters.startDate).toLocaleDateString('fr-FR')}`}
                                            onRemove={() => removeFilter('startDate')}
                                        />
                                    )}
                                    {localFilters.endDate && (
                                        <FilterTag
                                            label={`Au: ${new Date(localFilters.endDate).toLocaleDateString('fr-FR')}`}
                                            onRemove={() => removeFilter('endDate')}
                                        />
                                    )}
                                    {localFilters.idDevise && selectedDevise && (
                                        <FilterTag
                                            label={`Devise: ${selectedDevise.nom}`}
                                            onRemove={() => removeFilter('idDevise')}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Boutons d'action */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-end gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Réinitialiser
                        </button>
                    )}
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
}

// Composant Tag pour les filtres actifs
function FilterTag({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {label}
            <button
                onClick={onRemove}
                className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
                <X className="h-2.5 w-2.5" />
            </button>
        </span>
    );
}

// Version compacte pour les petits écrans
export function CompactFiltersBar(props) {
    return <LightFiltersBar {...props} compact />;
}

// Version avec seulement les filtres essentiels
export function EssentialFiltersBar(props) {
    return <LightFiltersBar {...props} showPeriodSelector={false} compact />;
}