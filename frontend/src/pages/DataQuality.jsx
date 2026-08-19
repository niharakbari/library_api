import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckSquare, Square, Loader2, Database, ShieldAlert } from 'lucide-react';

export default function DataQuality() {
  const [checks, setChecks] = useState({
    authors: false,
    language: false,
    subject: false,
    publish_year: false
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleToggle = (key) => {
    setChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeChecks = Object.entries(checks)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);

  const runQualityCheck = async () => {
    if (activeChecks.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await axios.get('/api/data-quality', {
        params: { checks: activeChecks.join(',') }
      });
      
      if (response.data.success) {
        setResults(response.data.data || []);
      } else {
        setError('Failed to fetch data quality results.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while running data quality checks.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when filters change, if we've searched at least once or immediately if we want real-time
  useEffect(() => {
    if (hasSearched) {
      runQualityCheck();
    }
  }, [checks]);

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={24} color="var(--primary)" />
          Data Quality
        </h1>
        <p className="page-subtitle">Identify incomplete records in your local library catalog.</p>
      </header>

      <div className="card" style={{ marginBottom: '32px', backgroundColor: 'var(--bg)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0 }}>Select Checks</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
            <input 
              type="checkbox" 
              checked={checks.authors} 
              onChange={() => handleToggle('authors')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Missing Authors
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
            <input 
              type="checkbox" 
              checked={checks.language} 
              onChange={() => handleToggle('language')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Missing Languages
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
            <input 
              type="checkbox" 
              checked={checks.subject} 
              onChange={() => handleToggle('subject')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Missing Subjects
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
            <input 
              type="checkbox" 
              checked={checks.publish_year} 
              onChange={() => handleToggle('publish_year')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Missing Publish Year
          </label>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn-primary" 
            onClick={runQualityCheck} 
            disabled={loading || activeChecks.length === 0}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldAlert size={18} />}
            Run Quality Check
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid #FFCDCD', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading && !results.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      ) : hasSearched && results.length > 0 ? (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            Found {results.length} record{results.length !== 1 ? 's' : ''} requiring attention
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Title</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Work Key</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Publish Year</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((book) => (
                  <tr key={book.id || book.open_library_work_key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 500 }}>{book.title || 'Unknown Title'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {book.open_library_work_key || book.workKey || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {book.first_publish_year || book.firstPublishYear || 'Missing'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Link 
                        to={`/books/${(book.open_library_work_key || book.workKey || '').replace('/works/', '')}`} 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        View Book
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : hasSearched && activeChecks.length > 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <CheckSquare size={48} style={{ opacity: 0.2, marginBottom: '16px', color: 'var(--success)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>All Clear!</h3>
          <p style={{ margin: 0, fontSize: '15px' }}>No records found matching the selected missing criteria.</p>
        </div>
      ) : null}
    </div>
  );
}
