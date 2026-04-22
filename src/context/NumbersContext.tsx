import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VIPNumber {
  id: string;
  phone: string;
  price: string; // This is the selling price
  purchaseCost: number;
  numerologyTotal: number;
  category: string;
  energy: string;
  available: boolean;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Map API field names (snake_case) to frontend (camelCase)
function mapFromAPI(n: Record<string, any>): VIPNumber {
  return {
    id: String(n.id),
    phone: String(n.phone),
    price: String(n.price),
    purchaseCost: Number(n.purchase_cost ?? 0),
    numerologyTotal: Number(n.numerology_total ?? 1),
    category: String(n.category),
    energy: String(n.energy),
    available: Boolean(n.available),
  };
}

function mapToAPI(n: Partial<VIPNumber>) {
  return {
    phone: n.phone,
    price: n.price,
    purchase_cost: n.purchaseCost,
    numerology_total: n.numerologyTotal,
    category: n.category,
    energy: n.energy,
    available: n.available,
  };
}

interface NumbersContextType {
  numbers: VIPNumber[];
  categories: string[];
  loading: boolean;
  addNumber: (n: Omit<VIPNumber, 'id'>) => Promise<void>;
  updateNumber: (n: VIPNumber) => Promise<void>;
  deleteNumber: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NumbersContext = createContext<NumbersContextType | null>(null);

export const NumbersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numbers, setNumbers] = useState<VIPNumber[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = React.useMemo(() => {
    const list = numbers.map(n => n.category).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [numbers]);

  const fetchFromAPI = useCallback(async (): Promise<VIPNumber[] | null> => {
    try {
      const res = await fetch(`${API}/numbers`);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data.map(mapFromAPI) : null;
    } catch { return null; }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const apiData = await fetchFromAPI();
    if (apiData !== null) {
      setNumbers(apiData);
    } else {
      // If API fails completely, we show empty rather than stale local data
      setNumbers([]);
    }
    setLoading(false);
  }, [fetchFromAPI]);

  useEffect(() => { refresh(); }, [refresh]);

  const addNumber = async (n: Omit<VIPNumber, 'id'>) => {
    const res = await fetch(`${API}/numbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapToAPI(n)),
    });
    if (res.ok) await refresh();
  };

  const updateNumber = async (updated: VIPNumber) => {
    const res = await fetch(`${API}/numbers/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapToAPI(updated)),
    });
    if (res.ok) await refresh();
  };

  const deleteNumber = async (id: string) => {
    const res = await fetch(`${API}/numbers/${id}`, { method: 'DELETE' });
    if (res.ok) await refresh();
  };

  return (
    <NumbersContext.Provider value={{ numbers, categories, loading, addNumber, updateNumber, deleteNumber, refresh }}>
      {children}
    </NumbersContext.Provider>
  );
};

export const useNumbers = () => {
  const ctx = useContext(NumbersContext);
  if (!ctx) throw new Error('useNumbers must be used within NumbersProvider');
  return ctx;
};
