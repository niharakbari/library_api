import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, Loader2, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookSearch() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [searchLimit, setSearchLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [batchLimit, setBatchLimit] = useState(50);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [importingWorks, setImportingWorks] = useState({});
  const [selectedWorks, setSelectedWorks] = useState(new Set());
  const [message, setMessage] = useState(null);

  const executeSearch = async (currentOffset = 0) => {
    if (!title && !author) return;

    setIsSearching(true);
    setMessage(null);
    setSelectedWorks(new Set()); // Reset selections on new page/search
    try {
      const response = await axios.get('/api/books/search', {
        params: { title, author, limit: searchLimit, offset: currentOffset }
      });
      if (response.data.success) {
        setResults(response.data.data.results || []);
        setTotal(response.data.data.total || 0);
        setOffset(currentOffset);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to search books.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    executeSearch(0);
  };

  const handleNextPage = () => {
    executeSearch(offset + searchLimit);
  };

  const handlePrevPage = () => {
    if (offset >= searchLimit) {
      executeSearch(offset - searchLimit);
    }
  };

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
    if (!title && !author) return;
    setIsBatchImporting(true);
    try {
      const response = await axios.post('/api/books/import/batch', { title, author, limit: batchLimit, offset: 0 });
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
      <header className="page-header">
        <h1 className="page-title">Book Search</h1>
        <p className="page-subtitle">Search Open Library and import metadata.</p>
      </header>

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

      <div className="card" style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Title</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Author</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Limit</label>
            <input 
              type="number"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px', backgroundColor: 'var(--card-bg)' }}
              value={searchLimit}
              onChange={(e) => setSearchLimit(Number(e.target.value))}
              min="1"
              max="200"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSearching} style={{ height: '42px', flex: '0 0 auto' }}>
            {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
            Search
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Results ({total} found)</h2>
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
                  borderColor: selectedWorks.has(work.key) ? 'var(--primary)' : 'var(--border)',
                  boxShadow: selectedWorks.has(work.key) ? '0 0 0 1px var(--primary)' : '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                  <input 
                    type="checkbox"
                    checked={selectedWorks.has(work.key)}
                    onChange={() => toggleSelection(work.key)}
                    style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
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
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{work.author_name?.join(', ') || 'Unknown Author'}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Published: {work.first_publish_year || 'Unknown'}</p>
                  
                  <button 
                    className="btn-primary"
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                    onClick={() => handleSingleImport(work.key)}
                    disabled={importingWorks[work.key] || isBatchImporting}
                  >
                    {importingWorks[work.key] ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Import'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {total > searchLimit && (
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
