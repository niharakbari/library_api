import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Loader2, List as ListIcon, PieChart, Activity, Layers } from 'lucide-react';

import socket from '../socket';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444', '#14B8A6', '#F97316', '#06B6D4'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Toggles for Graph/List
  const [viewAuthors, setViewAuthors] = useState('graph');
  const [viewSubjects, setViewSubjects] = useState('graph');
  const [viewLanguages, setViewLanguages] = useState('graph');

  useEffect(() => {
    const fetchReport = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/advanced/report?limit=${limit}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
        });
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Failed to load reports.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching report data.');
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    
    fetchReport();

    let throttleTimeout = null;
    let pendingUpdate = false;

    const handleLibraryUpdated = () => {
      if (!throttleTimeout) {
        fetchReport(true);
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          if (pendingUpdate) {
            pendingUpdate = false;
            handleLibraryUpdated();
          }
        }, 1000);
      } else {
        pendingUpdate = true;
      }
    };

    socket.on("library_updated", handleLibraryUpdated);

    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      socket.off("library_updated", handleLibraryUpdated);
    };
  }, [limit, retryCount]);

  const handleDrillDown = (type, query) => {
    navigate(`/search?mode=local&type=${type}&q=${encodeURIComponent(query)}`);
  };

  const renderHorizontalBarChart = (items, type, colorIndex = 0) => {
    if (!items || items.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>No data available</div>;
    const max = Math.max(...items.map(d => d.count));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} role="list">
        {items.map((item, i) => (
          <div 
            key={item.name} 
            onClick={() => handleDrillDown(type, item.name)} 
            role="button"
            tabIndex={0}
            aria-label={`Filter by ${type} ${item.name} (${item.count} books)`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown(type, item.name)}
            style={{ cursor: 'pointer', outlineOffset: '4px' }} 
            className="chart-item-focus"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }} title={item.name}>{item.name || 'Unknown'}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.count}</span>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--bg)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.max((item.count / max) * 100, 1)}%`, 
                  backgroundColor: COLORS[colorIndex % COLORS.length], 
                  height: '100%', 
                  borderRadius: '6px',
                  transition: 'width 0.5s ease-out' 
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderList = (items, type) => {
    if (!items || items.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>No data available</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} role="list">
        {items.map(item => (
          <div 
            key={item.name} 
            onClick={() => handleDrillDown(type, item.name)} 
            role="button"
            tabIndex={0}
            aria-label={`Filter by ${type} ${item.name} (${item.count} books)`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown(type, item.name)}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FAFAFA', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', outlineOffset: '2px' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            className="chart-item-focus"
          >
            <span style={{ fontWeight: 500, wordBreak: 'break-word', paddingRight: '12px' }}>{item.name || 'Unknown'}</span>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{item.count} books</span>
          </div>
        ))}
      </div>
    );
  };

  const renderVerticalBarChart = (items, type) => {
    if (!items || items.length === 0) return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>No data available</div>;
    
    // Sort items by year ascending to ensure chronological order
    const sortedItems = [...items].sort((a, b) => {
      const yearA = parseInt(a.name) || 0;
      const yearB = parseInt(b.name) || 0;
      return yearA - yearB;
    });

    const max = Math.max(...sortedItems.map(d => d.count));

    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          height: '320px', 
          gap: '16px', 
          width: '100%', 
          overflowX: 'auto', 
          padding: '20px 10px 40px 10px',
          borderBottom: '1px solid var(--border)'
        }} 
        role="list"
      >
        {sortedItems.map((item) => (
          <div 
            key={item.name} 
            onClick={() => handleDrillDown(type, item.name)} 
            role="button"
            tabIndex={0}
            aria-label={`Filter by year ${item.name} (${item.count} books)`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown(type, item.name)}
            style={{ 
              flex: '0 0 auto', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              cursor: 'pointer', 
              minWidth: '56px',
              height: '100%',
              outlineOffset: '4px',
              position: 'relative'
            }} 
            title={`Year ${item.name}: ${item.count} book${item.count !== 1 ? 's' : ''}`}
            className="chart-item-focus group"
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
              {item.count}
            </div>
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '48px', 
                height: `${Math.max((item.count / max) * 200, 4)}px`, 
                backgroundColor: 'var(--primary)', 
                opacity: 0.85,
                borderRadius: '4px 4px 0 0', 
                transition: 'all 0.2s ease-in-out' 
              }} 
              onMouseOver={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseOut={e => { e.currentTarget.style.opacity = 0.85; e.currentTarget.style.filter = 'none'; }}
            />
            <div style={{ 
              fontSize: '13px', 
              marginTop: '12px', 
              color: 'var(--text-secondary)', 
              fontWeight: 500,
              textAlign: 'center'
            }}>
              {item.name || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDonutChart = (items, type) => {
    if (!items || items.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>No data available</div>;
    
    // Safety check: A donut is unreadable with too many items and runs out of distinct colors.
    // Fall back to a horizontal bar chart automatically when there are many languages.
    if (items.length > 7) {
      return renderHorizontalBarChart(items, type, 3);
    }
    
    const total = items.reduce((sum, d) => sum + d.count, 0);
    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '220px', height: '220px' }}>
          <svg viewBox="0 0 32 32" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', borderRadius: '50%' }} aria-label={`${type} distribution chart`} role="graphics-document">
            {items.map((slice, i) => {
              const percent = slice.count / total;
              // Ensure even 1 item works perfectly (dashArray "100 100")
              const dashArray = `${percent * 100} 100`;
              const dashOffset = -cumulativePercent * 100;
              cumulativePercent += percent;
              return (
                <circle
                  key={slice.name}
                  r="16"
                  cx="16"
                  cy="16"
                  fill="transparent"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth="10"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  onClick={() => handleDrillDown(type, slice.name)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter by ${type} ${slice.name} (${slice.count} books, ${Math.round(percent * 100)}%)`}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown(type, slice.name)}
                  style={{ cursor: 'pointer', transition: 'stroke-dasharray 0.5s ease, opacity 0.2s', outline: 'none' }}
                  onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                  onMouseOut={e => e.currentTarget.style.opacity = 1}
                  onFocus={e => e.currentTarget.style.opacity = 0.8}
                  onBlur={e => e.currentTarget.style.opacity = 1}
                >
                  <title>{slice.name}: {slice.count} books ({Math.round(percent * 100)}%)</title>
                </circle>
              );
            })}
          </svg>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: '150px' }} role="list">
          {items.map((item, i) => (
            <div 
              key={item.name} 
              onClick={() => handleDrillDown(type, item.name)} 
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${type} ${item.name} (${item.count} books)`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown(type, item.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', padding: '4px', borderRadius: '4px', outlineOffset: '2px' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              onFocus={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
              onBlur={e => e.currentTarget.style.backgroundColor = 'transparent'}
              className="chart-item-focus"
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>{item.name || 'Unknown'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Advanced Reports</h1>
          <p className="page-subtitle">Visual insights into your library catalog.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Show Top:</span>
          {[5, 10, 20].map(val => (
            <button 
              key={val}
              onClick={() => setLimit(val)}
              style={{
                background: limit === val ? 'var(--primary)' : 'transparent',
                color: limit === val ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {val}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)', backgroundColor: '#FEF2F2', borderRadius: '12px', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div>{error}</div>
          <button 
            onClick={() => setRetryCount(c => c + 1)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: 'var(--error)', border: 'none' }}
          >
            Retry
          </button>
        </div>
      ) : loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--primary)' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Chart: Books by Year */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}><Activity size={20} color={COLORS[1]} /></div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Books by Publish Year</h2>
            </div>
            {renderVerticalBarChart(data.booksByYear, 'year')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            
            {/* Top Authors */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}><BarChart2 size={20} color={COLORS[0]} /></div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Top Authors</h2>
                </div>
                <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
                  <button onClick={() => setViewAuthors('graph')} style={{ padding: '4px 8px', border: 'none', background: viewAuthors === 'graph' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewAuthors === 'graph' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><BarChart2 size={16} color={viewAuthors === 'graph' ? 'var(--primary)' : '#6B7280'} /></button>
                  <button onClick={() => setViewAuthors('list')} style={{ padding: '4px 8px', border: 'none', background: viewAuthors === 'list' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewAuthors === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><ListIcon size={16} color={viewAuthors === 'list' ? 'var(--primary)' : '#6B7280'} /></button>
                </div>
              </div>
              {viewAuthors === 'graph' ? renderHorizontalBarChart(data.topAuthors, 'author', 0) : renderList(data.topAuthors, 'author')}
            </div>

            {/* Top Subjects */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}><Layers size={20} color={COLORS[2]} /></div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Top Subjects</h2>
                </div>
                <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
                  <button onClick={() => setViewSubjects('graph')} style={{ padding: '4px 8px', border: 'none', background: viewSubjects === 'graph' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewSubjects === 'graph' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><BarChart2 size={16} color={viewSubjects === 'graph' ? 'var(--primary)' : '#6B7280'} /></button>
                  <button onClick={() => setViewSubjects('list')} style={{ padding: '4px 8px', border: 'none', background: viewSubjects === 'list' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewSubjects === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><ListIcon size={16} color={viewSubjects === 'list' ? 'var(--primary)' : '#6B7280'} /></button>
                </div>
              </div>
              {viewSubjects === 'graph' ? renderHorizontalBarChart(data.topSubjects, 'subject', 2) : renderList(data.topSubjects, 'subject')}
            </div>

            {/* Languages Distribution */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}><PieChart size={20} color={COLORS[3]} /></div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Language Distribution</h2>
                </div>
                <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '2px' }}>
                  <button onClick={() => setViewLanguages('graph')} style={{ padding: '4px 8px', border: 'none', background: viewLanguages === 'graph' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewLanguages === 'graph' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><PieChart size={16} color={viewLanguages === 'graph' ? 'var(--primary)' : '#6B7280'} /></button>
                  <button onClick={() => setViewLanguages('list')} style={{ padding: '4px 8px', border: 'none', background: viewLanguages === 'list' ? '#fff' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewLanguages === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}><ListIcon size={16} color={viewLanguages === 'list' ? 'var(--primary)' : '#6B7280'} /></button>
                </div>
              </div>
              {viewLanguages === 'graph' ? renderDonutChart(data.topLanguages, 'language') : renderList(data.topLanguages, 'language')}
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
