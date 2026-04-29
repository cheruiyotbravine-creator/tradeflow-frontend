import React, { useState, useEffect } from 'react';
import { referralAPI } from '../services/api';
import toast from 'react-hot-toast';

const Referral = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, leaderRes] = await Promise.all([
        referralAPI.getStats(),
        referralAPI.getLeaderboard(),
      ]);
      setStats(statsRes.data.data);
      setLeaderboard(leaderRes.data.data);
    } catch (err) {
      toast.error('Failed to load referral data.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading referral data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          Back to Trading
        </button>
        <h1 style={styles.title}>Referral Program</h1>
        <p style={styles.subtitle}>Invite friends and earn rewards together</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats?.totalReferrals || 0}</div>
          <div style={styles.statLabel}>Total Referrals</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>${stats?.referralEarnings || 0}</div>
          <div style={styles.statLabel}>Total Earnings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{stats?.referralCode}</div>
          <div style={styles.statLabel}>Your Code</div>
        </div>
      </div>

      {/* Referral Link Box */}
      <div style={styles.linkBox}>
        <h3 style={styles.linkTitle}>Your Referral Link</h3>
        <p style={styles.linkDesc}>
          Share this link. When friends register and trade, you earn rewards!
        </p>
        <div style={styles.linkRow}>
          <div style={styles.linkText}>{stats?.referralLink}</div>
          <button
            onClick={copyLink}
            style={{
              ...styles.copyBtn,
              background: copied
                ? 'linear-gradient(135deg, #00cc66, #00ff88)'
                : 'linear-gradient(135deg, #00d4ff, #0099ff)',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div style={styles.howItWorks}>
        <h3 style={styles.sectionTitle}>How It Works</h3>
        <div style={styles.stepsRow}>
          {[
            { step: '1', icon: '📤', text: 'Share your unique referral link with friends' },
            { step: '2', icon: '📝', text: 'Friend registers using your link' },
            { step: '3', icon: '💹', text: 'Friend places their first trade' },
            { step: '4', icon: '💰', text: 'You earn $5 reward automatically' },
          ].map((item) => (
            <div key={item.step} style={styles.stepCard}>
              <div style={styles.stepNumber}>{item.step}</div>
              <div style={styles.stepIcon}>{item.icon}</div>
              <div style={styles.stepText}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={styles.bottomGrid}>

        {/* Referred Users */}
        <div style={styles.referredBox}>
          <h3 style={styles.sectionTitle}>People You Referred</h3>
          {stats?.referredUsers?.length === 0 ? (
            <div style={styles.emptyState}>
              No referrals yet. Share your link to get started!
            </div>
          ) : (
            <div style={styles.userList}>
              {stats?.referredUsers?.map((u, i) => (
                <div key={i} style={styles.userItem}>
                  <span style={styles.userEmail}>{u.email}</span>
                  <span style={styles.userDate}>
                    {new Date(u.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div style={styles.leaderboardBox}>
          <h3 style={styles.sectionTitle}>Top Referrers</h3>
          {leaderboard.length === 0 ? (
            <div style={styles.emptyState}>
              No referrers yet. Be the first!
            </div>
          ) : (
            <div style={styles.leaderList}>
              {leaderboard.map((entry, i) => (
                <div key={i} style={styles.leaderItem}>
                  <span style={styles.leaderRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span style={styles.leaderEmail}>{entry.email}</span>
                  <span style={styles.leaderCount}>{entry.referralCount} refs</span>
                  <span style={styles.leaderEarnings}>${entry.earnings}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    padding: '24px',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#0f0f1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: '#00d4ff',
    fontSize: '18px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '15px',
    margin: 0,
  },
  statsGrid: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '150px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#00d4ff',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    marginTop: '4px',
  },
  linkBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  linkTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
  },
  linkDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    marginBottom: '16px',
    marginTop: 0,
  },
  linkRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkText: {
    flex: 1,
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#00d4ff',
    wordBreak: 'break-all',
  },
  copyBtn: {
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  howItWorks: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
  },
  stepsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  stepCard: {
    flex: 1,
    minWidth: '140px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #00d4ff, #0099ff)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#000',
  },
  stepIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  stepText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  bottomGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  referredBox: {
    flex: 1,
    minWidth: '280px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  leaderboardBox: {
    flex: 1,
    minWidth: '280px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  emptyState: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '32px 0',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
  },
  userDate: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
  },
  leaderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  leaderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
  },
  leaderRank: {
    fontSize: '18px',
    width: '30px',
  },
  leaderEmail: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
  },
  leaderCount: {
    color: '#00d4ff',
    fontSize: '13px',
  },
  leaderEarnings: {
    color: '#00ff88',
    fontSize: '13px',
    fontWeight: '700',
  },
};

export default Referral;