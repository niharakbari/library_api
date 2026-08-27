import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Globe, Search, ArrowLeft, Download, Loader2, CheckSquare, AlertTriangle } from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';

export default function Languages() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingAll, setExportingAll] = useState(false);
  const [message, setMessage] = useState(null);
  
  const handleExportAll = () => {
    downloadCSV('/api/export/languages', 'library_languages.csv', setExportingAll, setMessage);
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('/api/books/languages');
        if (response.data.success) {
          setLanguages(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch languages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const filteredLanguages = languages.filter(lang => 
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="page-title">Languages</h1>
          <p className="page-subtitle">Select a language to search the Open Library catalog.</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExportAll} 
          disabled={exportingAll}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exportingAll ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Languages
        </button>
      </header>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search languages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading languages...</div>
        ) : filteredLanguages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No languages found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {filteredLanguages.map((lang) => (
              <div 
                key={lang.id} 
                onClick={() => navigate(`/search?mode=local&type=language&q=${encodeURIComponent(lang.code)}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  backgroundColor: 'var(--bg)', borderRadius: '8px', cursor: 'pointer',
                  border: '1px solid transparent', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Globe size={18} color="var(--text-secondary)" />
                <span style={{ fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dark)' }}>{lang.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
