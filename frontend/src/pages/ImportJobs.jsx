import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { RefreshCw, FileText } from 'lucide-react';

export default function ImportJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/books/import/jobs');
      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'var(--primary)';
      case 'completed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Import Jobs</h1>
          <p className="page-subtitle">Monitor batch import processes.</p>
        </div>
        <button className="btn-secondary" onClick={fetchJobs}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>ID</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Query</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Progress</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Updated</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Dupes</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && jobs.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No jobs found.</td></tr>
            ) : (
              jobs.map(job => {
                const percent = job.total_records > 0 ? Math.round((job.processed_records / job.total_records) * 100) : 0;
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500 }}>#{job.id}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{job.query_text}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '4px 10px', 
                        borderRadius: '100px', 
                        fontSize: '13px', 
                        fontWeight: 500,
                        backgroundColor: `${getStatusColor(job.status)}20`,
                        color: getStatusColor(job.status)
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusColor(job.status) }}></span>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: getStatusColor(job.status), transition: 'width 0.3s' }}></div>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '40px' }}>{percent}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: job.updated_records > 0 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {job.updated_records || 0}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: job.duplicate_records > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                      {job.duplicate_records || 0}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Link to={`/jobs/${job.id}/logs`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <FileText size={14} /> Logs
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
