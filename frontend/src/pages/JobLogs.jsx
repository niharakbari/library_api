import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Terminal } from 'lucide-react';

export default function JobLogs() {
  const { jobId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`/api/books/import/jobs/${jobId}/logs`);
        if (response.data.success) {
          setLogs(response.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="page-container">
      <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <header className="page-header">
        <h1 className="page-title">Job #{jobId} Logs</h1>
        <p className="page-subtitle">Real-time execution logs for this batch import.</p>
      </header>

      <div className="card" style={{ backgroundColor: '#1A1A1A', borderColor: '#333', padding: 0, overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#252525', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #333' }}>
          <Terminal size={16} color="#E8C547" />
          <span style={{ color: '#E8C547', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>terminal_output</span>
        </div>
        
        <div style={{ padding: '24px', height: '500px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading && logs.length === 0 ? (
            <div style={{ color: '#888' }}>Fetching logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ color: '#888' }}>No logs recorded yet.</div>
          ) : (
            logs.map(log => {
              const date = new Date(log.created_at);
              const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
              
              let color = '#E5E5E5'; // info
              if (log.level === 'error') color = '#FF5252';
              if (log.level === 'warning') color = '#FFD740';

              return (
                <div key={log.id} style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#666', flexShrink: 0 }}>[{timeString}]</span>
                  <span style={{ color }}>{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
