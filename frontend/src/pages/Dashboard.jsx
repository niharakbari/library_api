import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  List, 
  Library, 
  BookOpen, 
  Users, 
  Tags, 
  Globe, 
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import socket from '../socket';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [stats, setStats] = useState({
    books: 0,
    authors: 0,
    subjects: 0,
    languages: 0,
    jobs: { total: 0, running: 0, pending: 0, completed: 0, failed: 0 }
  });
  
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const axiosConfig = {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
        };
        
        const [statsRes, booksRes, jobsRes] = await Promise.all([
          axios.get('/api/dashboard/stats', axiosConfig),
          axios.get('/api/books/catalog', { ...axiosConfig, params: { limit: 5 } }),
          axios.get('/api/books/import/jobs', { ...axiosConfig, params: { limit: 3 } })
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (booksRes.data.success) setRecentBooks(booksRes.data.data.results || []);
        if (jobsRes.data.success) setRecentJobs(jobsRes.data.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    fetchDashboardData();

    let throttleTimeout = null;
    let pendingUpdate = false;

    const handleLibraryUpdated = (data) => {
      console.log("Socket received 'library_updated':", data);
      
      if (!throttleTimeout) {
        fetchDashboardData(true);
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          if (pendingUpdate) {
            pendingUpdate = false;
            handleLibraryUpdated({ reason: 'catch_up' });
          }
        }, 1000);
      } else {
        pendingUpdate = true;
      }
    };

    socket.on("library_updated", handleLibraryUpdated);

    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      socket.off("library_updated", handleLibraryUpdated);
    };
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'var(--primary)';
      case 'completed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'var(--text-dark)', linkTo }) => {
    const content = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
          <div style={{ padding: '8px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
            <Icon size={20} color={color} />
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color }}>
          {loading ? '-' : value.toLocaleString()}
        </div>
      </>
    );

    if (linkTo) {
      return (
        <Link to={linkTo} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          {content}
        </Link>
      );
    }

    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', gap: '16px' }}>
        {content}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="page-title">Welcome, {user.name || 'Admin'}</h1>
        <p className="page-subtitle">Library Management Overview</p>
      </header>

      {/* 1. TOP - Library Statistics */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-secondary)' }}>Library Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <StatCard title="Total Books" value={stats.books} icon={BookOpen} color="var(--primary)" linkTo="/library" />
          <StatCard title="Total Authors" value={stats.authors} icon={Users} linkTo="/authors" />
          <StatCard title="Total Subjects" value={stats.subjects} icon={Tags} linkTo="/subjects" />
          <StatCard title="Languages" value={stats.languages} icon={Globe} linkTo="/languages" />
          <StatCard title="Active Jobs" value={stats.jobs.running + stats.jobs.pending} icon={Activity} color="var(--success)" linkTo="/jobs" />
        </div>
      </section>

      {/* 2. MIDDLE - Library Overview */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-secondary)' }}>Library Overview</h2>
        <div className="dashboard-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* Recent Books */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Recently Imported Books</h3>
              <Link to="/library" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>View All</Link>
            </div>
            <div style={{ padding: '12px 24px' }}>
              {loading ? (
                <div style={{ padding: '20px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</div>
              ) : recentBooks.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>No books imported yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentBooks.map((book) => (
                    <Link to={`/books/${book.key.replace('/works/', '')}`} key={book.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--bg)', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: '40px', height: '60px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                        {book.cover_i && <img src={`${import.meta.env.VITE_OPENLIBRARY_COVERS_URL}/${book.cover_i}-S.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {book.author_name?.length > 0 ? book.author_name.join(', ') : 'Unknown Author'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Recent Import Activity</h3>
              <Link to="/jobs" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>View All</Link>
            </div>
            <div style={{ padding: '12px 24px' }}>
              {loading ? (
                <div style={{ padding: '20px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</div>
              ) : recentJobs.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>No import activity yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentJobs.map((job) => {
                     const percent = job.total_records > 0 ? Math.round((job.processed_records / job.total_records) * 100) : 0;
                     return (
                       <Link to={`/jobs/${job.id}/logs`} key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--bg)', textDecoration: 'none', color: 'inherit' }}>
                         <div style={{ padding: '10px', backgroundColor: `${getStatusColor(job.status)}15`, borderRadius: '8px', color: getStatusColor(job.status) }}>
                            {job.status === 'completed' ? <CheckCircle2 size={20} /> : job.status === 'failed' ? <AlertCircle size={20} /> : <Activity size={20} />}
                         </div>
                         <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                             <span style={{ fontWeight: 500, fontSize: '14px' }}>Job #{job.id}</span>
                             <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{percent}%</span>
                           </div>
                           <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                             {job.query_text}
                           </div>
                           <div style={{ height: '4px', backgroundColor: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
                             <div style={{ width: `${percent}%`, height: '100%', backgroundColor: getStatusColor(job.status) }}></div>
                           </div>
                         </div>
                       </Link>
                     );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM - Feature Hub */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-secondary)' }}>Feature Hub</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <Link to="/search" className="card" style={{ display: 'flex', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ padding: '12px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: '#fff', height: 'fit-content' }}>
              <Search size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Search Books</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Query the Open Library database and import metadata directly.</p>
            </div>
          </Link>

          <Link to="/library" className="card" style={{ display: 'flex', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '12px', color: 'var(--text-primary)', height: 'fit-content' }}>
              <Library size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>My Library</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>View and manage books imported into your local catalog.</p>
            </div>
          </Link>

          <Link to="/jobs" className="card" style={{ display: 'flex', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '12px', color: 'var(--text-primary)', height: 'fit-content' }}>
              <List size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Import Jobs</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Monitor the status and progress of batch import operations.</p>
            </div>
          </Link>

          <Link to="/search" className="card" style={{ display: 'flex', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: '12px', color: 'var(--text-primary)', height: 'fit-content' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Batch Import</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Initiate bulk processing for large metadata imports.</p>
            </div>
          </Link>

        </div>
      </section>

    </div>
  );
}
