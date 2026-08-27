import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, ArrowLeft, Download, Loader2, CheckSquare, AlertTriangle } from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleExportAll = () => {
    downloadCSV('/api/export/authors', 'library_authors.csv', setExportingAll, setMessage);
  };
  
  const handleExportAuthorBooks = (e, author) => {
    e.stopPropagation();
    downloadCSV(`/api/export/books/author/${author.id}`, `author_${author.id}_books.csv`, 
      (isExporting) => setExportingId(isExporting ? author.id : null), 
      setMessage
    );
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('/api/books/authors');
        if (response.data.success) {
          setAuthors(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch authors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.type === 'success' ? <CheckSquare size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">Select an author to search the Open Library catalog.</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExportAll} 
          disabled={exportingAll}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exportingAll ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Authors
        </button>
      </header>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search authors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading authors...</div>
        ) : filteredAuthors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No authors found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {filteredAuthors.map((author) => (
              <div 
                key={author.id} 
                onClick={() => navigate(`/search?mode=local&type=author&q=${encodeURIComponent(author.name)}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', 
                  border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer',
                  transition: 'all 0.2s', backgroundColor: 'transparent'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                  <Users size={20} color="var(--text-dark)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dark)' }}>{author.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Key: {author.open_library_author_key}</div>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => handleExportAuthorBooks(e, author)}
                  disabled={exportingId === author.id}
                  title="Export this author's books"
                  style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {exportingId === author.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
