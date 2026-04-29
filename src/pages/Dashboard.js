import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { derivAPI } from '../services/api';
import useLivePrice from '../hooks/useLivePrice';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Referral from './Referral';

const SYMBOLS = [
  { value: 'R_10', label: 'Volatility 10' },
  { value: 'R_25', label: 'Volatility 25' },
  { value: 'R_50', label: 'Volatility 50' },
  { value: 'R_75', label: 'Volatility 75' },
  { value: 'R_100', label: 'Volatility 100' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('R_100');
  const [balance, setBalance] = useState(null);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [duration, setDuration] = useState(5);
  const [trading, setTrading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showReferral, setShowReferral] = useState(false);

  const { price, priceHistory, trend } = useLivePrice(selectedSymbol);

  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await derivAPI.getBalance();
      setBalance(res.data.data);
    } catch (err) {
      console.error('Balance error:', err.message);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await derivAPI.getHistory();
      setHistory(res.data.data?.transactions || []);
    } catch (err) {
      console.error('History error:', err.message);
    }
  };

  const placeTrade = async (direction) => {
    if (trading) return;
    setTrading(true);

    try {
      await derivAPI.placeTrade({
        symbol: selectedSymbol,
        direction,
        amount: tradeAmount,
        duration,
        duration_unit: 'm',
      });

      toast.success(`✅ ${direction} trade placed! $${tradeAmount} for ${duration}min`);
      setTimeout(() => {
        loadBalance();
        loadHistory();
      }, 2000);

    } catch (err) {
      const message = err.response?.data?.message || 'Trade failed. Please try again.';
      toast.error(message);
    } finally {
      setTrading(false);
    }
  };

  const trendColor = trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff4466' : '#00d4ff';

  // ── SHOW REFERRAL PAGE ───────────────────────────
  if (showReferral) {
    return <Referral onBack={() => setShowReferral(false)} />;
  }

  // ── MAIN DASHBOARD ───────────────────────────────
  return (
    <div style={styles.container}>

      {/* TOP NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>📈 TradeFlow</div>

        <div style={styles.navCenter}>
          {SYMBOLS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedSymbol(s.value)}
              style={{
                ...styles.symbolBtn,
                background: selectedSymbol === s.value
                  ? 'rgba(0,212,255,0.2)'
                  : 'transparent',
                borderColor: selectedSymbol === s.value
                  ? '#00d4ff'
                  : 'rgba(255,255,255,0.1)',
                color: selectedSymbol === s.value
                  ? '#00d4ff'
                  : 'rgba(255,255,255,0.6)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={styles.navRight}>
          <span style={styles.userEmail}>{user?.email}</span>
          <button
            onClick={() => setShowReferral(true)}
            style={styles.referralBtn}
          >
            🔗 Referral
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={styles.main}>

        {/* LEFT PANEL: Chart + Trade Controls */}
        <div style={styles.leftPanel}>

          {/* Price Header */}
          <div style={styles.priceHeader}>
            <div>
              <div style={styles.symbolLabel}>
                {SYMBOLS.find(s => s.value === selectedSymbol)?.label}
              </div>
              <div style={{ ...styles.priceDisplay, color: trendColor }}>
                {price ? price.toFixed(3) : '---'}
                <span style={styles.trendArrow}>
                  {trend === 'up' ? ' ▲' : trend === 'down' ? ' ▼' : ''}
                </span>
              </div>
            </div>

            {balance && (
              <div style={styles.balanceBox}>
                <div style={styles.balanceLabel}>Balance</div>
                <div style={styles.balanceValue}>
                  ${parseFloat(balance.balance).toFixed(2)}
                </div>
                <div style={styles.balanceCurrency}>{balance.currency}</div>
              </div>
            )}
          </div>

          {/* Live Chart */}
          <div style={styles.chartBox}>
            {priceHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={priceHistory}>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={trendColor}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.chartLoading}>
                ⏳ Loading live price data...
              </div>
            )}
          </div>

          {/* Trade Controls */}
          <div style={styles.tradePanel}>
            <div style={styles.tradeControls}>
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Stake Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  style={styles.controlInput}
                />
              </div>
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Duration (minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={styles.controlInput}
                >
                  {[1, 2, 3, 5, 10, 15, 30].map((d) => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>
            </div>

            {/* UP / DOWN Buttons */}
            <div style={styles.tradeButtons}>
              <button
                onClick={() => placeTrade('UP')}
                disabled={trading || !price}
                style={{
                  ...styles.upBtn,
                  opacity: trading || !price ? 0.5 : 1,
                  cursor: trading || !price ? 'not-allowed' : 'pointer',
                }}
              >
                ▲ UP
                <span style={styles.btnSub}>Rise</span>
              </button>
              <button
                onClick={() => placeTrade('DOWN')}
                disabled={trading || !price}
                style={{
                  ...styles.downBtn,
                  opacity: trading || !price ? 0.5 : 1,
                  cursor: trading || !price ? 'not-allowed' : 'pointer',
                }}
              >
                ▼ DOWN
                <span style={styles.btnSub}>Fall</span>
              </button>
            </div>

            {trading && (
              <div style={styles.tradingMsg}>⏳ Placing trade...</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Trade History */}
        <div style={styles.rightPanel}>
          <h3 style={styles.historyTitle}>📋 Trade History</h3>

          {history.length === 0 ? (
            <div style={styles.noHistory}>
              No trades yet. Place your first trade!
            </div>
          ) : (
            <div style={styles.historyList}>
              {history.map((trade, i) => (
                <div key={i} style={styles.historyItem}>
                  <div style={styles.historyLeft}>
                    <div style={styles.historySymbol}>
                      {trade.symbol || 'Trade'}
                    </div>
                    <div style={styles.historyDirection}>
                      <span style={{
                        color: trade.direction === 'UP' ? '#00ff88' : '#ff4466',
                        fontWeight: '700',
                        fontSize: '12px',
                      }}>
                        {trade.direction === 'UP' ? '▲' : '▼'} {trade.direction}
                      </span>
                      <span style={styles.historyAmount}>
                        ${trade.amount}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    ...styles.historyStatus,
                    color: trade.status === 'won'
                      ? '#00ff88'
                      : trade.status === 'lost'
                        ? '#ff4466'
                        : '#00d4ff',
                  }}>
                    {trade.status === 'won'
                      ? `+$${trade.profit?.toFixed(2) || trade.payout?.toFixed(2)}`
                      : trade.status === 'lost'
                        ? `-$${trade.amount}`
                        : trade.status?.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { loadBalance(); loadHistory(); }}
            style={styles.refreshBtn}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '64px',
    background: 'rgba(0,0,0,0.4)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  navLogo: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#00d4ff',
  },
  navCenter: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  symbolBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
  },
  referralBtn: {
    background: 'rgba(0,212,255,0.1)',
    border: '1px solid rgba(0,212,255,0.3)',
    color: '#00d4ff',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'rgba(255,68,102,0.15)',
    border: '1px solid rgba(255,68,102,0.3)',
    color: '#ff4466',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  main: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  priceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px 24px',
  },
  symbolLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    marginBottom: '4px',
  },
  priceDisplay: {
    fontSize: '42px',
    fontWeight: '800',
    transition: 'color 0.3s',
  },
  trendArrow: { fontSize: '24px' },
  balanceBox: { textAlign: 'right' },
  balanceLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
  balanceValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#00d4ff',
  },
  balanceCurrency: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
  chartBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    minHeight: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLoading: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '16px',
  },
  tradePanel: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  tradeControls: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  controlGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
  },
  controlInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
  },
  tradeButtons: {
    display: 'flex',
    gap: '16px',
  },
  upBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #00cc66, #00ff88)',
    border: 'none',
    borderRadius: '14px',
    padding: '20px',
    color: '#000',
    fontSize: '22px',
    fontWeight: '900',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'transform 0.1s',
  },
  downBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #cc0033, #ff4466)',
    border: 'none',
    borderRadius: '14px',
    padding: '20px',
    color: '#fff',
    fontSize: '22px',
    fontWeight: '900',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'transform 0.1s',
  },
  btnSub: {
    fontSize: '13px',
    fontWeight: '500',
    opacity: 0.8,
  },
  tradingMsg: {
    textAlign: 'center',
    color: '#00d4ff',
    marginTop: '12px',
    fontSize: '14px',
  },
  rightPanel: {
    width: '300px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
  },
  historyTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
  },
  noHistory: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px 0',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  historyLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  historySymbol: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '600',
  },
  historyDirection: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  historyAmount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
  },
  historyStatus: {
    fontSize: '14px',
    fontWeight: '700',
  },
  refreshBtn: {
    background: 'rgba(0,212,255,0.1)',
    border: '1px solid rgba(0,212,255,0.3)',
    color: '#00d4ff',
    borderRadius: '10px',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: 'auto',
  },
};

export default Dashboard;