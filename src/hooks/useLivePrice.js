import { useState, useEffect, useRef } from 'react';

const DERIV_APP_ID = '1089';
const DERIV_WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

const useLivePrice = (symbol) => {
  const [price, setPrice] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [trend, setTrend] = useState('neutral');
  const ws = useRef(null);
  const prevPrice = useRef(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    if (!symbol) return;

    isUnmounted.current = false;

    // Create WebSocket connection
    ws.current = new WebSocket(DERIV_WS_URL);

    ws.current.onopen = () => {
      // ✅ Only send AFTER connection is fully open
      if (!isUnmounted.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          ticks: symbol,
          subscribe: 1,
        }));
      }
    };

    ws.current.onmessage = (event) => {
      if (isUnmounted.current) return;

      const data = JSON.parse(event.data);
      if (data.tick) {
        const newPrice = data.tick.quote;

        if (prevPrice.current !== null) {
          if (newPrice > prevPrice.current) setTrend('up');
          else if (newPrice < prevPrice.current) setTrend('down');
          else setTrend('neutral');
        }

        prevPrice.current = newPrice;
        setPrice(newPrice);

        setPriceHistory((prev) => {
          const updated = [...prev, {
            time: new Date().toLocaleTimeString(),
            price: newPrice,
          }];
          return updated.slice(-30);
        });
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // ✅ Cleanup: mark as unmounted FIRST, then close safely
    return () => {
      isUnmounted.current = true;

      if (ws.current) {
        // Only send forget if connection is fully open
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ forget_all: 'ticks' }));
        }
        ws.current.close();
        ws.current = null;
      }
    };
  }, [symbol]);

  return { price, priceHistory, trend };
};

export default useLivePrice;