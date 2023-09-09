import { createContext, useContext, ReactNode, useState } from 'react';

const currencySymbolMapping: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
};


type ConfigContextType = {
    currency: string;
    setCurrency: (currency: string) => void;
    currencySymbol: string;
    timezone: string;
    setTimezone: (timezone: string) => void;
};

const defaultConfig: ConfigContextType = {
    currency: 'INR',
    setCurrency: () => {},
    currencySymbol: '₹',
    timezone: 'IST',
    setTimezone: () => {},
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export const useConfig = () => {
    return useContext(ConfigContext);
};

type Props = {
    children: ReactNode;
};

export const ConfigProvider = ({ children }: Props) => {
    const [currency, setCurrency] = useState<string>('USD');
    const [timezone, setTimezone] = useState<string>('UTC');

    // Derive the currencySymbol from the current currency state
    const currencySymbol = currencySymbolMapping[currency] || currency; // Default to currency code if symbol not found

    return (
        <ConfigContext.Provider value={{ currency, setCurrency, currencySymbol, timezone, setTimezone }}>
            {children}
        </ConfigContext.Provider>
    );
};
