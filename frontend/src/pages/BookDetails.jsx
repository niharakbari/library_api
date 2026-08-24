import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Download, Loader2, Star, Edit2, Check, X, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/UI/ConfirmModal';

export default function BookDetails() {
  const { workKey } = useParams();
  const cleanKey = workKey.replace('/works/', '');
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [work, setWork] = useState(null);
  const [editions, setEditions] = useState([]);
  const [localBook, setLocalBook] = useState(null);

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);

  // Review State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, reviewText: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  
  // Edit State
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(null);
  const [editMessage, setEditMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [workRes, editionsRes, localRes] = await Promise.all([
          axios.get(`/api/books/work/${workKey}`),
          axios.get(`/api/books/work/${workKey}/editions`),
          axios.get(`/api/books/catalog?workKey=${cleanKey}`)
        ]);
        
        if (workRes.data.success) setWork(workRes.data.data);
        if (editionsRes.data.success) setEditions(editionsRes.data.data.results || []);

        const foundLocal = localRes.data.success && localRes.data.data.results.length > 0 
          ? localRes.data.data.results[0] 
          : null;
        
        setLocalBook(foundLocal);

        if (foundLocal) {
          try {
            const reviewRes = await axios.get(`/api/books/${foundLocal.id}/review`);
            if (reviewRes.data.success && reviewRes.data.data) {
              setHasReview(true);
              setReviewData({
                rating: reviewRes.data.data.rating || 5,
                reviewText: reviewRes.data.data.review_text || ''
              });
            }
          } catch (err) {
            console.log('No existing review found or error fetching.');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (workKey) fetchData();
  }, [workKey, cleanKey]);

  const handleDeleteBook = async () => {
    if (!localBook?.id) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/books/delete/${localBook.id}`, {
        data: { bookIds: [localBook.id] }
      });
      if (response.data.success) {
        // Option A: Navigate to library
        navigate('/library', { state: { message: 'Book deleted successfully' } });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete book.' });
        setShowDeleteModal(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete book.' });
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async () => {
    // ...existing handleImport code...
    setImporting(true);
    setMessage(null);
    try {
      const response = await axios.post(`/api/books/import/${cleanKey}`);
      if (response.data.success) {
        if (response.data.data?.status === 'duplicate') {
          setMessage({ type: 'error', text: 'Already Imported — This book is already in your library.' });
        } else {
          setMessage({ type: 'success', text: 'Work imported successfully!' });
          // Fetch local catalog again so it immediately switches to "In Library"
          const localRes = await axios.get(`/api/books/catalog?workKey=${cleanKey}`);
          if (localRes.data.success && localRes.data.data.results.length > 0) {
            setLocalBook(localRes.data.data.results[0]);
          }
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import book.' });
    } finally {
      setImporting(false);
    }
  };

  const handleSaveReview = async () => {
    if (!localBook?.id) return;
    setSavingReview(true);
    try {
      let response;
      try {
        response = await axios.post(`/api/books/${localBook.id}/review`, reviewData);
      } catch (postErr) {
        if (postErr.response && postErr.response.status === 400) {
          response = await axios.patch(`/api/books/${localBook.id}/review`, reviewData);
        } else {
          throw postErr;
        }
      }
      if (response.data.success) {
        setHasReview(true);
        setMessage({ type: 'success', text: 'Review saved successfully!' });
        setIsReviewOpen(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save review.' });
    } finally {
      setSavingReview(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveAuthor = async () => {
    if (!localBook?.id) return;
    if (!editValue.trim()) {
      setEditMessage({ type: 'error', text: 'Author name cannot be empty' });
      return;
    }
    setSavingEdit('author');
    try {
      const response = await axios.post(`/api/books/author/${localBook.id}`, { newAuthor: editValue });
      if (response.data.success) {
        setLocalBook(prev => ({ ...prev, author_name: [editValue] }));
        setEditMessage({ type: 'success', text: 'Author updated' });
        setEditingAuthor(false);
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: 'Failed to update author' });
    } finally {
      setSavingEdit(null);
      setTimeout(() => setEditMessage(null), 3000);
    }
  };

  const handleSaveYear = async () => {
    if (!localBook?.id) return;
    const yearNum = parseInt(editValue, 10);
    if (isNaN(yearNum)) {
      setEditMessage({ type: 'error', text: 'Invalid year' });
      return;
    }
    setSavingEdit('year');
    try {
      const response = await axios.post(`/api/books/publishYear/${localBook.id}`, { publishYear: yearNum });
      if (response.data.success) {
        setLocalBook(prev => ({ ...prev, first_publish_year: yearNum }));
        setEditMessage({ type: 'success', text: 'Year updated' });
        setEditingYear(false);
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: 'Failed to update year' });
    } finally {
      setSavingEdit(null);
      setTimeout(() => setEditMessage(null), 3000);
    }
  };

  if (loading) return <div className="page-container"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading details...</div></div>;
  if (!work) return <div className="page-container"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>Record not found.</div></div>;

  const description = typeof work.description === 'string' ? work.description : work.description?.value || 'No description available.';

  return (
    <div className="page-container">
      <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="book-detail-hero" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ width: '300px', flexShrink: 0, maxWidth: '100%' }}>
          <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg)' }}>
            {work.covers?.[0] ? (
              <img src={`${import.meta.env.VITE_OPENLIBRARY_COVERS_URL}/${work.covers[0]}-L.jpg`} alt="cover" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: '#E5E5E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Cover</div>
            )}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.2 }}>{work.title}</h1>
              
              {/* Author Render & Edit */}
              <div style={{ marginBottom: '8px' }}>
                {editingAuthor ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '15px' }}
                      autoFocus
                    />
                    <button onClick={handleSaveAuthor} disabled={savingEdit === 'author'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                      {savingEdit === 'author' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
                    </button>
                    <button onClick={() => setEditingAuthor(false)} disabled={savingEdit === 'author'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--text-secondary)' }}>
                    <span>By: {localBook?.author_name?.length > 0 ? localBook.author_name.join(', ') : (work.author_name?.join(', ') || 'Unknown Author')}</span>
                    {localBook && (
                      <button 
                        onClick={() => { setEditingAuthor(true); setEditingYear(false); setEditValue(localBook.author_name?.[0] || ''); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '2px' }}
                        title="Edit Author"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                )}
                {editMessage && editMessage.text.includes('Author') && (
                  <div style={{ fontSize: '12px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '4px' }}>{editMessage.text}</div>
                )}
              </div>
            </div>

            {localBook ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flexShrink: 0, padding: '8px 16px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> In Library
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete Book"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleImport}
                disabled={importing}
                style={{ flexShrink: 0 }}
              >
                {importing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                Import to Library
              </button>
            )}
          </div>
          
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
              color: message.type === 'error' ? 'var(--error)' : 'var(--success)',
              border: `1px solid ${message.type === 'error' ? '#FFCDCD' : '#C8E6C9'}`
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {/* Year Render & Edit */}
            <div>
              {editingYear ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600 }}>First Published:</span>
                  <input 
                    type="number" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', width: '80px' }}
                    autoFocus
                  />
                  <button onClick={handleSaveYear} disabled={savingEdit === 'year'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                    {savingEdit === 'year' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                  </button>
                  <button onClick={() => setEditingYear(false)} disabled={savingEdit === 'year'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span><strong>First Published:</strong> {localBook?.first_publish_year || work.first_publish_year || work.first_publish_date || 'Unknown'}</span>
                  {localBook && (
                    <button 
                      onClick={() => { setEditingYear(true); setEditingAuthor(false); setEditValue(localBook.first_publish_year || ''); }} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '2px' }}
                      title="Edit Year"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              )}
              {editMessage && editMessage.text.includes('Year') && (
                <div style={{ fontSize: '12px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '4px' }}>{editMessage.text}</div>
              )}
            </div>
            
            <span><strong>ID:</strong> {workKey}</span>
          </div>
          
          <div className="card" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>About this Work</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{description}</p>
          </div>

          {localBook && (
            <div className="card" style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={18} fill={hasReview ? 'var(--primary)' : 'none'} color={hasReview ? 'var(--primary)' : 'currentColor'} />
                  My Review
                </h3>
                {!isReviewOpen && (
                  <button 
                    onClick={() => setIsReviewOpen(true)}
                    className="btn-secondary" 
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    {hasReview ? 'Edit Review' : 'Add Review'}
                  </button>
                )}
              </div>
              
              {isReviewOpen ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Rating (1-5)</label>
                    <input 
                      type="number" min="1" max="5" 
                      value={reviewData.rating} 
                      onChange={e => setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', width: '80px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Review</label>
                    <textarea 
                      rows={4}
                      value={reviewData.reviewText}
                      onChange={e => setReviewData(prev => ({ ...prev, reviewText: e.target.value }))}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', width: '100%', resize: 'vertical' }}
                      placeholder="Write your thoughts here..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', marginTop: '8px' }}>
                    <button onClick={handleSaveReview} className="btn-primary" disabled={savingReview}>
                      {savingReview ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Review'}
                    </button>
                    <button onClick={() => setIsReviewOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : hasReview ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                    <Star size={14} fill="var(--primary)" /> {reviewData.rating} / 5
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {reviewData.reviewText || <span style={{ fontStyle: 'italic', color: '#999' }}>No text review provided.</span>}
                  </p>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                  You haven't reviewed this book yet.
                </div>
              )}
            </div>
          )}

          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Editions ({editions.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editions.map(edition => (
              <div key={edition.key} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{edition.title}</h4>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <span>Published: {edition.publish_date || 'Unknown'}</span>
                    <span>Publisher: {edition.publishers?.[0] || 'Unknown'}</span>
                    <span>ISBN: {edition.isbn_13?.[0] || edition.isbn_10?.[0] || 'N/A'}</span>
                  </div>
                </div>
                <a href={`${import.meta.env.VITE_OPENLIBRARY_URL}${edition.key}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 12px' }}>
                  Open Library <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Book"
        message={`Are you sure you want to delete "${work?.title || localBook?.title || 'this book'}"? This action cannot be undone.`}
        confirmText="Delete Book"
        cancelText="Cancel"
        confirmVariant="danger"
        isProcessing={isDeleting}
        onConfirm={handleDeleteBook}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
