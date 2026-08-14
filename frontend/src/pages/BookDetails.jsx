import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function BookDetails() {
  const { workKey } = useParams();
  const [work, setWork] = useState(null);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [workRes, editionsRes] = await Promise.all([
          axios.get(`/api/books/work/${workKey}`),
          axios.get(`/api/books/work/${workKey}/editions`)
        ]);
        if (workRes.data.success) setWork(workRes.data.data);
        if (editionsRes.data.success) setEditions(editionsRes.data.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (workKey) fetchData();
  }, [workKey]);

  if (loading) return <div className="page-container"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading details...</div></div>;
  if (!work) return <div className="page-container"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--error)' }}>Record not found.</div></div>;

  const description = typeof work.description === 'string' ? work.description : work.description?.value || 'No description available.';

  return (
    <div className="page-container">
      <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg)' }}>
            {work.covers?.[0] ? (
              <img src={`https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`} alt="cover" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: '#E5E5E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Cover</div>
            )}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.2 }}>{work.title}</h1>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', color: 'var(--text-secondary)', fontSize: '15px' }}>
            <span><strong>First Published:</strong> {work.first_publish_year || work.first_publish_date || 'Unknown'}</span>
            <span><strong>ID:</strong> {workKey}</span>
          </div>
          
          <div className="card" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>About this Work</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{description}</p>
          </div>

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
                <a href={`https://openlibrary.org${edition.key}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 12px' }}>
                  Open Library <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
