import { useState, useEffect } from "react";

export interface StockData {
  id?: string;
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  category?: string;
}

export const useRealtimeUpdates = (initialData: StockData[], enabled: boolean = true) => {
  const [data, setData] = useState(initialData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setData(prevData => 
        prevData.map(stock => {
          // Simulate price changes between -2% and +2%
          const changePercent = (Math.random() - 0.5) * 4;
          const priceChange = stock.price * (changePercent / 100);
          const newPrice = Number((stock.price + priceChange).toFixed(2));
          const newChange = Number((stock.change + priceChange).toFixed(2));
          const newChangePercent = Number((stock.changePercent + changePercent).toFixed(2));

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent
          };
        })
      );
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  return { data, lastUpdate };
};
