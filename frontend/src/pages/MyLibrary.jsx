import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Library, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyLibrary() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const limit = 20;

  const fetchCatalog = async (currentOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/books/catalog', {
        params: { limit, offset: currentOffset }
      });
      if (response.data.success) {
        setResults(response.data.data.results || []);
        setTotal(response.data.data.total || 0);
        setOffset(currentOffset);
      }
    } catch (err) {
      setError('Failed to fetch local catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog(0);
  }, []);

  const handleNextPage = () => {
    fetchCatalog(offset + limit);
  };

  const handlePrevPage = () => {
    if (offset >= limit) {
      fetchCatalog(offset - limit);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <Library size={32} color="var(--primary)" />
        <div>
          <h1 className="page-title">My Library</h1>
          <p className="page-subtitle">View books imported into your local catalog.</p>
        </div>
      </header>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error)',
          border: '1px solid #FFCDCD'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          Loading your library...
        </div>
      ) : results.length > 0 ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Showing {results.length} of {total} books</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {results.map((work) => (
              <div 
                key={work.key} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                  {work.cover_i ? (
                    <img src={`https://covers.openlibrary.org/b/id/${work.cover_i}-M.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Cover</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Link to={`/books/${work.key.replace('/works/', '')}`} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {work.title}
                  </Link>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {work.author_name?.length > 0 ? work.author_name.join(', ') : 'Unknown Author'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Published: {work.first_publish_year || 'Unknown'}
                  </p>
                  
                  {(work.subject?.length > 0 || work.language?.length > 0) && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {work.language?.slice(0, 2).map((lang, idx) => (
                        <span key={`lang-${idx}`} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#E5E5E5', borderRadius: '100px', color: 'var(--text-secondary)' }}>
                          {lang.toUpperCase()}
                        </span>
                      ))}
                      {work.subject?.slice(0, 2).map((sub, idx) => (
                        <span key={`sub-${idx}`} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '100px' }}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button 
                className="btn-secondary" 
                onClick={handlePrevPage} 
                disabled={offset === 0}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>
              <button 
                className="btn-secondary" 
                onClick={handleNextPage} 
                disabled={offset + limit >= total}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Library size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Your library is empty</h3>
          <p style={{ margin: '0 0 24px 0' }}>Import books from Open Library to see them here.</p>
          <Link to="/search" className="btn-primary" style={{ display: 'inline-flex' }}>
            Go to Search
          </Link>
        </div>
      )}
    </div>
  );
}
