// src/hooks/useFeesData.js
import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { feesAPI } from '../api/feesAPI';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from 'AppContext';

export const useFeesData = (endpoint, initialFilters = {}) => {
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

    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async () => {
        // Annuler la requête précédente
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Utiliser le token depuis globalState
            const token = globalState?.key;
            const result = await feesAPI[endpoint](filters, token);

            // Vérifier le statut comme dans votre exemple
            if (result.status === 200 || result.status === 201) {
                // Extraire les données comme dans votre exemple
                const responseData = result.data?.data || result.data;
                setData(responseData);
            } else {
                setError(result.message || 'Erreur lors du chargement des données');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(`Error fetching ${endpoint}:`, err);
                setError(err.message || 'Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint, filters, globalState?.key]);

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

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
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