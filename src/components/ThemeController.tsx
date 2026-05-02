import React, { useEffect } from 'react';
import { useSettings } from '../context';

export const ThemeController: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return null;
};
