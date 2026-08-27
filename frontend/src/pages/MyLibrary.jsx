import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Library, Loader2, Download, ChevronLeft, ChevronRight, Edit2, Check, X, Star, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/UI/ConfirmModal';

export default function MyLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const limit = 20;


  // Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [deleteSelectedModalOpen, setDeleteSelectedModalOpen] = useState(false);

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedBooks(new Set());
  };

  const handleToggleSelectBook = (id) => {
    const newSet = new Set(selectedBooks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBooks(newSet);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedBooks);
    if (!ids.length) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/books/delete/${ids[0]}`, {
        data: { bookIds: ids }
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Selected books deleted successfully.' });
        setSelectedBooks(new Set());
        setDeleteSelectedModalOpen(false);
        fetchCatalog(offset);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete selected books.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Edit State
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editingYear, setEditingYear] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(null);
  const [editMessage, setEditMessage] = useState({});

  const [filters, setFilters] = useState({
    q: '',
    title: '',
    author: '',
    subject: '',
    language: '',
    year: ''
  });
  const [sort, setSort] = useState('recently_added');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    downloadCSV('/api/export/books', 'library_books.csv', setExporting, setMessage);
  };

  const fetchCatalog = async (currentOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      // Remove empty filters
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v.trim() !== ''));
      
      const response = await axios.get('/api/books/catalog', {
        params: { 
          limit, 
          offset: currentOffset,
          sort,
          ...activeFilters
        }
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


  // Clear Library State
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearLibrary = async () => {
    if (clearInput !== 'DELETE') return;
    setIsClearing(true);
    try {
      const response = await axios.delete('/api/books/clear');
      if (response.data.success) {
        setResults([]);
        setTotal(0);
        setClearModalOpen(false);
        setClearInput('');
        setMessage({ type: 'success', text: 'Library cleared successfully.' });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to clear library.' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to clear library.' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/books/delete/${bookToDelete.id}`, {
        data: { bookIds: [bookToDelete.id] }
      });
      if (response.data.success) {
        setResults(prev => prev.filter(b => b.id !== bookToDelete.id));
        setTotal(prev => prev - 1);
        setDeleteModalOpen(false);
        setBookToDelete(null);
        setMessage({ type: 'success', text: 'Book deleted successfully.' });
        setTimeout(() => setMessage(null), 5000);
        
        // Clear global message if any, since we're acting locally
        if (location.state?.message) {
          navigate(location.pathname, { replace: true });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to delete book.' });
        setTimeout(() => setMessage(null), 5000);
        setDeleteModalOpen(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete book.' });
      setTimeout(() => setMessage(null), 5000);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchCatalog(0);
  }, [sort]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage({ type: 'success', text: location.state.message });
      navigate(location.pathname, { replace: true });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [location, navigate]);


  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchCatalog(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      q: '',
      title: '',
      author: '',
      subject: '',
      language: '',
      year: ''
    });
    // fetchCatalog(0) will be called if we manually trigger it, or we just call it
    // Wait, state update is async, so we pass empty filters explicitly.
    setLoading(true);
    axios.get('/api/books/catalog', { params: { limit, offset: 0, sort } })
      .then(res => {
        setResults(res.data.data.results || []);
        setTotal(res.data.data.total || 0);
        setOffset(0);
      })
      .catch(() => setError('Failed to fetch local catalog.'))
      .finally(() => setLoading(false));
  };

  const handleNextPage = () => {
    fetchCatalog(offset + limit);
  };

  const handlePrevPage = () => {
    if (offset >= limit) {
      fetchCatalog(offset - limit);
    }
  };

  const handleSaveAuthor = async (bookId) => {
    if (!bookId) {
      setEditMessage({ id: bookId, type: 'error', text: 'Backend response must provide "id" to edit.' });
      return;
    }
    setSavingEdit(`author-${bookId}`);
    try {
      const response = await axios.post(`/api/books/author/${bookId}`, { newAuthor: editValue });
      if (response.data.success) {
        setResults(prev => prev.map(w => w.id === bookId ? { ...w, author_name: [editValue] } : w));
        setEditMessage({ id: bookId, type: 'success', text: 'Author updated' });
        setEditingAuthor(null);
      }
    } catch (err) {
      setEditMessage({ id: bookId, type: 'error', text: 'Failed to update author' });
    } finally {
      setSavingEdit(null);
      setTimeout(() => setEditMessage({}), 3000);
    }
  };

  const handleSaveYear = async (bookId) => {
    // ...existing handleSaveYear code...
    if (!bookId) {
      setEditMessage({ id: bookId, type: 'error', text: 'Backend response must provide "id" to edit.' });
      return;
    }
    const yearNum = parseInt(editValue, 10);
    if (isNaN(yearNum)) {
      setEditMessage({ id: bookId, type: 'error', text: 'Invalid year' });
      return;
    }
    setSavingEdit(`year-${bookId}`);
    try {
      const response = await axios.post(`/api/books/publishYear/${bookId}`, { publishYear: yearNum });
      if (response.data.success) {
        setResults(prev => prev.map(w => w.id === bookId ? { ...w, first_publish_year: yearNum } : w));
        setEditMessage({ id: bookId, type: 'success', text: 'Year updated' });
        setEditingYear(null);
      }
    } catch (err) {
      setEditMessage({ id: bookId, type: 'error', text: 'Failed to update year' });
    } finally {
      setSavingEdit(null);
      setTimeout(() => setEditMessage({}), 3000);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <Library size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Library</h1>
            <p className="page-subtitle" style={{ marginTop: '4px', marginBottom: 0 }}>View books imported into your local catalog.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={handleExport} 
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {exporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
            Export
          </button>
          
          <button 
            className={isSelectMode ? "btn-primary" : "btn-secondary"} 
            onClick={handleToggleSelectMode}
          >
            {isSelectMode ? 'Cancel Selection' : 'Select'}
          </button>
          
          {isSelectMode && selectedBooks.size > 0 && (
             <button 
               className="btn-primary" 
               onClick={() => setDeleteSelectedModalOpen(true)} 
               style={{ backgroundColor: '#e55a5a', color: '#ffffff', borderColor: '#e55a5a' }}
             >
               Delete Selected ({selectedBooks.size})
             </button>
          )}

          {isSelectMode && (
             <button 
               className="btn-secondary" 
               onClick={() => setClearModalOpen(true)} 
               style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
             >
               Delete All
             </button>
          )}
        </div>
      </header>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>General Search</label>
              <input type="text" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Any keyword..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Title</label>
              <input type="text" name="title" value={filters.title} onChange={handleFilterChange} placeholder="Title..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Author</label>
              <input type="text" name="author" value={filters.author} onChange={handleFilterChange} placeholder="Author..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Subject</label>
              <input type="text" name="subject" value={filters.subject} onChange={handleFilterChange} placeholder="Subject..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Language Code</label>
              <input type="text" name="language" value={filters.language} onChange={handleFilterChange} placeholder="e.g. eng, fre..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Publish Year</label>
              <input type="number" name="year" value={filters.year} onChange={handleFilterChange} placeholder="e.g. 2024..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }} />
            </div>
          </div>

          <div className="filter-actions-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Sort By:</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg)', cursor: 'pointer' }}>
                <option value="recently_added">Recently Added</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="year_newest">Newest First</option>
                <option value="year_oldest">Oldest First</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={handleClearFilters} className="btn-secondary">Clear Filters</button>
              <button type="submit" className="btn-primary">Apply Filters</button>
            </div>
          </div>
        </form>
      </div>

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
                onClick={(e) => {
                  if (isSelectMode) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleSelectBook(work.id);
                  } else {
                    navigate(`/books/${work.key.replace('/works/', '')}`);
                  }
                }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  cursor: isSelectMode ? 'default' : 'pointer',
                  border: isSelectMode && selectedBooks.has(work.id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                {isSelectMode && (
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedBooks.has(work.id)}
                      readOnly
                      style={{ transform: 'scale(1.5)', pointerEvents: 'none' }}
                    />
                  </div>
                )}
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setBookToDelete(work); setDeleteModalOpen(true); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--error)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', zIndex: 10 }}
                    title="Delete Book"
                  >
                    <Trash2 size={14} />
                  </button>
                  {work.cover_i ? (
                    <img src={`${import.meta.env.VITE_OPENLIBRARY_COVERS_URL}/${work.cover_i}-M.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Cover</div>
                  )}
                </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Link to={`/books/${work.key.replace('/works/', '')}`} state={{ localBookId: work.id }} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {work.title}
                    </Link>
                    
                    {/* Author Edit UI */}
                    <div style={{ marginBottom: '4px' }}>
                      {editingAuthor === work.key ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px', flex: 1 }}
                            autoFocus
                          />
                          <button onClick={() => handleSaveAuthor(work.id)} disabled={savingEdit === `author-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                            {savingEdit === `author-${work.id}` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button onClick={() => setEditingAuthor(null)} disabled={savingEdit === `author-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <span>{work.author_name?.length > 0 ? work.author_name.join(', ') : 'Unknown Author'}</span>
                          <button 
                            onClick={(e) => { e.preventDefault(); setEditingAuthor(work.key); setEditingYear(null); setEditValue(work.author_name?.length > 0 ? work.author_name[0] : ''); }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                            title="Edit Author"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                      {editMessage.id === work.id && editMessage.text.includes('Author') && (
                        <div style={{ fontSize: '11px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '2px' }}>{editMessage.text}</div>
                      )}
                    </div>

                    {/* Year Edit UI */}
                    <div style={{ marginBottom: '8px' }}>
                      {editingYear === work.key ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px', width: '80px' }}
                            autoFocus
                          />
                          <button onClick={() => handleSaveYear(work.id)} disabled={savingEdit === `year-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                            {savingEdit === `year-${work.id}` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button onClick={() => setEditingYear(null)} disabled={savingEdit === `year-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span>Published: {work.first_publish_year || 'Unknown'}</span>
                          <button 
                            onClick={(e) => { e.preventDefault(); setEditingYear(work.key); setEditingAuthor(null); setEditValue(work.first_publish_year || ''); }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                            title="Edit Year"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                      {editMessage.id === work.id && editMessage.text.includes('Year') && (
                        <div style={{ fontSize: '11px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '2px' }}>{editMessage.text}</div>
                      )}
                    {/* Review Badge */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: work.is_reviewed ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {work.is_reviewed ? '✓ Reviewed' : 'Not Reviewed'}
                      </span>
                    </div>
                  </div>
                  
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
            <div className="pagination-row" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Book"
        message={`Are you sure you want to delete "${bookToDelete?.title}" from your library? This action cannot be undone.`}
        confirmText="Delete Book"
        cancelText="Cancel"
        confirmVariant="danger"
        isProcessing={isDeleting}
        onConfirm={handleDeleteBook}
        onCancel={() => setDeleteModalOpen(false)}
      />

      
      <ConfirmModal 
        isOpen={deleteSelectedModalOpen}
        title="Delete Selected Books"
        message={`Are you sure you want to permanently delete ${selectedBooks.size} selected books?`}
        confirmText="Delete"
        confirmVariant="danger"
        isProcessing={isDeleting}
        onConfirm={handleDeleteSelected}
        onCancel={() => setDeleteSelectedModalOpen(false)}
      />

      {clearModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
        }}>
          <div className="card" style={{ padding: '32px', width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: 'var(--error)' }}>Clear Library</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This will permanently delete ALL books, authors, languages, and subject mappings. 
              <br/><br/>
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input 
              type="text" 
              value={clearInput}
              onChange={(e) => setClearInput(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setClearModalOpen(false); setClearInput(''); }} disabled={isClearing}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#e55a5a', color: '#ffffff', borderColor: '#e55a5a' }}
                onClick={handleClearLibrary} 
                disabled={isClearing || clearInput !== 'DELETE'}
              >
                {isClearing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
