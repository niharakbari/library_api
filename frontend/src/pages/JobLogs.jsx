import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle, Info, FileText } from 'lucide-react';

export default function JobLogs() {
  const { jobId } = useParams();
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [jobSummary, setJobSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, jobsRes, itemsRes] = await Promise.all([
          axios.get(`/api/books/import/jobs/${jobId}/logs`),
          axios.get('/api/books/import/jobs?limit=100'), // Fetch list to extract summary
          axios.get(`/api/books/import/jobs/${jobId}/items`)
        ]);
        
        if (logsRes.data.success) {
          setLogs(logsRes.data.data || []);
        }
        
        if (jobsRes.data.success) {
          const foundJob = jobsRes.data.data.jobs.find(j => j.id === Number(jobId));
          if (foundJob) setJobSummary(foundJob);
        }

        if (itemsRes.data.success) {
          setItems(itemsRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> Completed</span>;
      case 'partially_completed': return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--warning-bg)', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Partially Completed</span>;
      case 'failed': return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--error-bg)', color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><XCircle size={14} /> Failed</span>;
      case 'running': return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#E3F2FD', color: '#1976D2', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={14} style={{ animation: 'spin 2s linear infinite' }} /> Running</span>;
      default: return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563' }}>{status}</span>;
    }
  };

  const getItemBadge = (status) => {
    switch (status) {
      case 'imported': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid #bbf7d0' }}>IMPORTED</span>;
      case 'updated': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #bae6fd' }}>UPDATED</span>;
      case 'duplicate': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}>DUPLICATE</span>;
      case 'skipped': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--warning-bg)', color: '#D97706', border: '1px solid #fde68a' }}>SKIPPED</span>;
      case 'failed': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid #fecaca' }}>FAILED</span>;
      case 'processing': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #fde68a' }}>PROCESSING</span>;
      default: return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}>{status}</span>;
    }
  };

  const getLogLevelBadge = (level) => {
    switch (level) {
      case 'info': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #BFDBFE' }}><Info size={12} /> INFO</span>;
      case 'warning': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#FFFBEB', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #FDE68A' }}><AlertTriangle size={12} /> WARN</span>;
      case 'error': return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #FECACA' }}><XCircle size={12} /> ERROR</span>;
      default: return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}>{level}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  if (loading && !jobSummary) {
    return <div className="page-container"><div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading job details...</div></div>;
  }

  return (
    <div className="page-container">
      <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Job #{jobId}</h1>
          {jobSummary && getStatusBadge(jobSummary.status)}
        </div>
      </div>

      {jobSummary && (
        <div className="card" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Records</span>
            <span style={{ fontSize: '24px', fontWeight: 700 }}>{jobSummary.total_records}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Processed</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{jobSummary.processed_records}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Imported</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{jobSummary.successful_records}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Updated</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0284C7' }}>{jobSummary.updated_records}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Skipped</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#D97706' }}>{jobSummary.skipped_records || 0}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Failed</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--error)' }}>{jobSummary.failed_records}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Started At</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(jobSummary.started_at)}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Completed At</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(jobSummary.completed_at)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Processed Books Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Processed Books</h2>
        </div>
        
        <div style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
          {loading && items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Fetching items...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No books processed yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    padding: '16px 20px', 
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    backgroundColor: item.status === 'failed' ? '#FEF2F2' : '#FFFFFF',
                    transition: 'background-color 0.2s',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ width: '90px', flexShrink: 0, paddingTop: '2px' }}>
                      {getItemBadge(item.status)}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Link 
                        to={`/books/${item.open_library_work_key}`}
                        style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {item.title || `Work: ${item.open_library_work_key}`}
                      </Link>
                      
                      {item.error_message && (
                        <span style={{ fontSize: '13px', color: 'var(--error)', marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={14} /> {item.error_message}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ flexShrink: 0, color: 'var(--text-secondary)', fontSize: '12px', paddingTop: '4px' }}>
                      {new Date(item.created_at).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Activity Log</h2>
        </div>
        
        <div style={{ padding: '0', maxHeight: '600px', overflowY: 'auto' }}>
          {loading && logs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Fetching logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No logs recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {logs.map((log, index) => {
                const isLast = index === logs.length - 1;
                return (
                  <div key={log.id} style={{ 
                    display: 'flex', 
                    padding: '16px 20px', 
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    backgroundColor: log.level === 'error' ? '#FEF2F2' : log.level === 'warning' ? '#FFFBEB' : '#FFFFFF',
                    transition: 'background-color 0.2s',
                    gap: '16px'
                  }}>
                    <div style={{ width: '80px', flexShrink: 0, paddingTop: '2px' }}>
                      {getLogLevelBadge(log.level)}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.5, fontWeight: log.level === 'error' ? 500 : 400 }}>{log.message}</span>
                      {log.open_library_work_key && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', backgroundColor: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', border: '1px solid var(--border)' }}>
                          {log.open_library_work_key}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ flexShrink: 0, color: 'var(--text-secondary)', fontSize: '12px', paddingTop: '4px' }}>
                      {new Date(log.created_at).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
