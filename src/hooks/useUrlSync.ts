import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from '../context';

export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useFilters();

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      urlFilters[key] = value;
    });

    if (Object.keys(urlFilters).length > 0) {
      const newFilters: Record<string, any> = { ...filters };

      if (urlFilters.search !== undefined) newFilters.search = urlFilters.search;
      if (urlFilters.category !== undefined) newFilters.category = urlFilters.category;
      if (urlFilters.brand !== undefined) newFilters.brand = urlFilters.brand;
      if (urlFilters.priceMin !== undefined) newFilters.priceMin = urlFilters.priceMin ? Number(urlFilters.priceMin) : null;
      if (urlFilters.priceMax !== undefined) newFilters.priceMax = urlFilters.priceMax ? Number(urlFilters.priceMax) : null;
      if (urlFilters.favoritesOnly !== undefined) newFilters.favoritesOnly = urlFilters.favoritesOnly === 'true';
      if (urlFilters.learningStatus !== undefined) newFilters.learningStatus = urlFilters.learningStatus;
      if (urlFilters.tags !== undefined) newFilters.tags = urlFilters.tags.split(',');

      setFilters(newFilters);
    }
  }, []); // Only on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category && filters.category !== 'Tous') params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.priceMin !== null) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== null) params.set('priceMax', String(filters.priceMax));
    if (filters.favoritesOnly) params.set('favoritesOnly', 'true');
    if (filters.learningStatus && filters.learningStatus !== 'Tous') params.set('learningStatus', filters.learningStatus);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));

    // Don't set empty search params
    if (params.toString()) {
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  }, [filters, setSearchParams]);

  return null;
};
