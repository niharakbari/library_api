import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tags, Search, ArrowLeft, Download, Loader2, CheckSquare, AlertTriangle } from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleExportAll = () => {
    downloadCSV('/api/export/subjects', 'library_subjects.csv', setExportingAll, setMessage);
  };
  
  const handleExportSubjectBooks = (e, subject) => {
    e.stopPropagation();
    downloadCSV(`/api/export/books/subject/${subject.id}`, `subject_${subject.id}_books.csv`, 
      (isExporting) => setExportingId(isExporting ? subject.id : null), 
      setMessage
    );
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('/api/books/subjects');
        if (response.data.success) {
          setSubjects(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Select a subject to search the Open Library catalog.</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={handleExportAll} 
          disabled={exportingAll}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {exportingAll ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
          Export Subjects
        </button>
      </header>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                onClick={() => navigate(`/search?mode=local&type=subject&q=${encodeURIComponent(subject.name)}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  backgroundColor: 'var(--bg)', borderRadius: '8px', cursor: 'pointer',
                  border: '1px solid transparent', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Tags size={18} color="var(--text-secondary)" />
                <span style={{ flex: 1, fontWeight: 500, fontSize: '14px', textTransform: 'capitalize', color: 'var(--text-dark)' }}>{subject.name}</span>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => handleExportSubjectBooks(e, subject)}
                  disabled={exportingId === subject.id}
                  title="Export books for this subject"
                  style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseOut={e => e.currentTarget.style.color = ''}
                >
                  {exportingId === subject.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
