import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, Loader2, CheckSquare, ChevronLeft, ChevronRight, BookOpen, Library } from 'lucide-react';

export default function BookSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Mode
  const [searchMode, setSearchMode] = useState('openlibrary'); // 'openlibrary' | 'local'

  // Open Library Search State
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [searchLimit, setSearchLimit] = useState(20);
  
  // Local Library Search State
  const [localSearchType, setLocalSearchType] = useState('title');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // General Search State
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState(null);

  // Import State
  const [batchLimit, setBatchLimit] = useState(50);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [importingWorks, setImportingWorks] = useState({});
  const [selectedWorks, setSelectedWorks] = useState(new Set());

  // Auto-search on mount if query params exist
  useEffect(() => {
    if (searchParams.get('title') || searchParams.get('author') || searchParams.get('subject') || searchParams.get('language')) {
      executeOpenLibrarySearch(0, {
        t: searchParams.get('title') || '',
        a: searchParams.get('author') || '',
        s: searchParams.get('subject') || '',
        l: searchParams.get('language') || '',
      });
    }
  }, []); // Run only on mount

  const executeOpenLibrarySearch = async (currentOffset = 0, overrideParams = null) => {
    const t = overrideParams?.t ?? title;
    const a = overrideParams?.a ?? author;
    const s = overrideParams?.s ?? subject;
    const l = overrideParams?.l ?? language;

    if (!t && !a && !s && !l) return;

    setIsSearching(true);
    setMessage(null);
    setSelectedWorks(new Set());
    setSearchMode('openlibrary');
    
    try {
      const response = await axios.get('/api/books/search', {
        params: { title: t, author: a, subject: s, language: l, limit: searchLimit, offset: currentOffset }
      });
      if (response.data.success) {
        setResults(response.data.data.results || []);
        setTotal(response.data.data.total || 0);
        setOffset(currentOffset);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to search Open Library.' });
    } finally {
      setIsSearching(false);
    }
  };

  const executeLocalSearch = async () => {
    if (!localSearchQuery.trim()) return;

    setIsSearching(true);
    setMessage(null);
    setSelectedWorks(new Set());
    
    try {
      const response = await axios.get(`/inventory/search/${localSearchType}`, {
        params: { [localSearchType]: localSearchQuery }
      });
      if (response.data.success) {
        // Map local inventory to common card format
        const formattedResults = response.data.data.map(item => ({
          key: `/works/${item.open_library_work_key}`,
          title: item.title,
          first_publish_year: item.first_publish_year,
          cover_i: item.cover_id,
          author_name: [],
          subject: [],
          language: []
        }));
        setResults(formattedResults);
        setTotal(formattedResults.length);
        setOffset(0);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || `Failed to search Local Library by ${localSearchType}.` });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchMode === 'openlibrary') {
      executeOpenLibrarySearch(0);
    } else {
      executeLocalSearch();
    }
  };

  const handleNextPage = () => {
    if (searchMode === 'openlibrary') executeOpenLibrarySearch(offset + searchLimit);
    // Note: Local search currently doesn't implement pagination in the backend
  };

  const handlePrevPage = () => {
    if (searchMode === 'openlibrary' && offset >= searchLimit) {
      executeOpenLibrarySearch(offset - searchLimit);
    }
  };

  // --- Import Logic (Open Library only) ---
  const toggleSelection = (key) => {
    setSelectedWorks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWorks.size === results.length) {
      setSelectedWorks(new Set());
    } else {
      setSelectedWorks(new Set(results.map(w => w.key)));
    }
  };

  const handleSingleImport = async (workKey) => {
    setImportingWorks(prev => ({ ...prev, [workKey]: true }));
    try {
      const cleanKey = workKey.replace('/works/', '');
      const response = await axios.post(`/api/books/import/${cleanKey}`);
      if (response.data.success) {
        if (response.data.data?.status === 'duplicate') {
          setMessage({ type: 'error', text: 'Already Imported — This book is already in your library.' });
        } else {
          setMessage({ type: 'success', text: 'Work imported successfully!' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import book.' });
    } finally {
      setImportingWorks(prev => ({ ...prev, [workKey]: false }));
    }
  };

  const handleImportSelected = async () => {
    if (selectedWorks.size === 0) return;
    setIsBatchImporting(true);
    let successCount = 0;
    for (const key of selectedWorks) {
      setImportingWorks(prev => ({ ...prev, [key]: true }));
      try {
        const cleanKey = key.replace('/works/', '');
        await axios.post(`/api/books/import/${cleanKey}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to import ${key}`, error);
      } finally {
        setImportingWorks(prev => ({ ...prev, [key]: false }));
      }
    }
    setIsBatchImporting(false);
    setMessage({ type: 'success', text: `Successfully imported ${successCount} out of ${selectedWorks.size} selected works.` });
    setSelectedWorks(new Set());
  };

  const handleBatchImport = async () => {
    if (!title && !author && !subject && !language) return;
    setIsBatchImporting(true);
    try {
      const response = await axios.post('/api/books/import/batch', { title, author, subject, language, limit: batchLimit, offset: 0 });
      if (response.data.success) {
        setMessage({ type: 'success', text: `Batch job started! Job ID: ${response.data.data.jobId}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start batch import.' });
    } finally {
      setIsBatchImporting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Book Search</h1>
        <p className="page-subtitle">Find and explore books across local and external libraries.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button 
          onClick={() => { setSearchMode('openlibrary'); setResults([]); setTotal(0); setMessage(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
            backgroundColor: searchMode === 'openlibrary' ? 'var(--primary)' : 'transparent',
            color: searchMode === 'openlibrary' ? '#fff' : 'var(--text-secondary)',
            fontWeight: searchMode === 'openlibrary' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <BookOpen size={18} /> Open Library
        </button>
        <button 
          onClick={() => { setSearchMode('local'); setResults([]); setTotal(0); setMessage(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
            backgroundColor: searchMode === 'local' ? 'var(--primary)' : 'transparent',
            color: searchMode === 'local' ? '#fff' : 'var(--text-secondary)',
            fontWeight: searchMode === 'local' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Library size={18} /> My Library
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: message.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
          color: message.type === 'error' ? 'var(--error)' : 'var(--success)',
          border: `1px solid ${message.type === 'error' ? '#FFCDCD' : '#C8E6C9'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Search Forms */}
      <div className="card" style={{ marginBottom: '32px' }}>
        {searchMode === 'openlibrary' ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Title</label>
              <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Author</label>
              <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Subject</label>
              <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Language (ISO)</label>
              <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="eng" />
            </div>
            <div style={{ flex: '0 0 80px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Limit</label>
              <input type="number" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px', backgroundColor: 'var(--card-bg)' }} value={searchLimit} onChange={(e) => setSearchLimit(Number(e.target.value))} min="1" max="200" />
            </div>
            <button type="submit" className="btn-primary" disabled={isSearching || (!title && !author && !subject && !language)} style={{ height: '42px', flex: '0 0 auto' }}>
              {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
              Search
            </button>
          </form>
        ) : (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={localSearchType}
              onChange={(e) => setLocalSearchType(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer', height: '42px' }}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="language">Language Code</option>
            </select>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder={`Search local catalog by ${localSearchType}...`}
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'var(--font-sans)', outline: 'none', height: '42px' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSearching || !localSearchQuery.trim()} style={{ height: '42px', flex: '0 0 auto' }}>
              {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
              Search Local
            </button>
          </form>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Results ({total} found)</h2>
            
            {searchMode === 'openlibrary' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={toggleSelectAll}>
                  <CheckSquare size={16} /> {selectedWorks.size === results.length ? 'Deselect All' : 'Select All'}
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleImportSelected} 
                  disabled={selectedWorks.size === 0 || isBatchImporting}
                >
                  {isBatchImporting && selectedWorks.size > 0 ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                  Import Selected ({selectedWorks.size})
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
                  <input 
                    type="number" 
                    value={batchLimit} 
                    onChange={e => setBatchLimit(Number(e.target.value))} 
                    style={{ width: '70px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px' }} 
                    min="1" 
                    max="1000"
                  />
                  <button className="btn-secondary" onClick={handleBatchImport} disabled={isBatchImporting}>
                    {isBatchImporting && selectedWorks.size === 0 ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                    Batch Import Top
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {results.map((work) => {
              const cleanKey = work.key.replace('/works/', '');
              return (
                <div 
                  key={work.key} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '16px', 
                    gap: '16px',
                    borderColor: searchMode === 'openlibrary' && selectedWorks.has(work.key) ? 'var(--primary)' : 'var(--border)',
                    boxShadow: searchMode === 'openlibrary' && selectedWorks.has(work.key) ? '0 0 0 1px var(--primary)' : '0 4px 12px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                    {searchMode === 'openlibrary' && (
                      <input 
                        type="checkbox"
                        checked={selectedWorks.has(work.key)}
                        onChange={() => toggleSelection(work.key)}
                        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    )}
                    {work.cover_i ? (
                      <img src={`https://covers.openlibrary.org/b/id/${work.cover_i}-M.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: searchMode === 'local' ? 'pointer' : 'default' }} onClick={() => searchMode === 'local' && navigate(`/books/${cleanKey}`)} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: searchMode === 'local' ? 'pointer' : 'default' }} onClick={() => searchMode === 'local' && navigate(`/books/${cleanKey}`)}>No Cover</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Link to={`/books/${cleanKey}`} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {work.title}
                    </Link>
                    {searchMode === 'openlibrary' && (
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{work.author_name?.join(', ') || 'Unknown Author'}</p>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Published: {work.first_publish_year || 'Unknown'}</p>
                    
                    {searchMode === 'openlibrary' && (
                      <button 
                        className="btn-primary"
                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                        onClick={() => handleSingleImport(work.key)}
                        disabled={importingWorks[work.key] || isBatchImporting}
                      >
                        {importingWorks[work.key] ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Import to Library'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {searchMode === 'openlibrary' && total > searchLimit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button 
                className="btn-secondary" 
                onClick={handlePrevPage} 
                disabled={offset === 0 || isSearching}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {Math.floor(offset / searchLimit) + 1} of {Math.ceil(total / searchLimit)}
              </span>
              <button 
                className="btn-secondary" 
                onClick={handleNextPage} 
                disabled={offset + searchLimit >= total || isSearching}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
