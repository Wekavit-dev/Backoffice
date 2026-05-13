import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from 'AppContext';
import { accountingLightAPI } from 'api/accountingLightAPI';

export const useAccountingLightData = (initialFilters = {}) => {
    const { globalState } = useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(() => {
        const urlFilters = {};
        for (const [key, value] of searchParams.entries()) {
            urlFilters[key] = value;
        }
        return { ...initialFilters, ...urlFilters };
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = globalState?.key;
            const result = await accountingLightAPI.getAccountingLight(filters, token);
            if (result.status === 200 || result.status === 201) {
                const responseData = result.data?.data || result.data;
                setData(responseData);
            } else {
                setError(result.message || 'Erreur lors du chargement de la comptabilité light');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [filters, globalState?.key]);

    const updateFilters = useCallback((newFilters, updateUrl = true) => {
        setFilters((prev) => {
            const mergedFilters = { ...prev, ...newFilters };
            const hasChanged = Object.keys(newFilters).some((key) => prev[key] !== newFilters[key]);

            if (updateUrl) {
                const params = new URLSearchParams();
                Object.entries(mergedFilters).forEach(([key, value]) => {
                    if (value && value !== 'all' && value !== '') {
                        params.set(key, value);
                    }
                });
                setSearchParams(params);
            }

            return hasChanged ? mergedFilters : prev;
        });
    }, [setSearchParams]);

    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        setSearchParams({});
    }, [initialFilters, setSearchParams]);

    useEffect(() => {
        if (globalState?.key) {
            fetchData();
        } else {
            setLoading(false);
            setError('Token d\'authentification manquant');
        }
    }, [fetchData, globalState?.key]);

    return {
        data,
        loading,
        error,
        filters,
        setFilters: updateFilters,
        resetFilters,
        refetch: fetchData
    };
};
