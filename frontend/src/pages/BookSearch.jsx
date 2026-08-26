import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, Loader2, CheckSquare, ChevronLeft, ChevronRight, BookOpen, Library } from 'lucide-react';
import socket from "../socket";

export default function BookSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Mode
  const [searchMode, setSearchMode] = useState('openlibrary'); // 'openlibrary' | 'local'

  // Open Library Search State
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [searchLimit, setSearchLimit] = useState(20);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Local Library Search State
  const [localSearchType, setLocalSearchType] = useState('title');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // General Search State
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState(null);

  // Import State
  const [batchLimit, setBatchLimit] = useState(50);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [importingWorks, setImportingWorks] = useState({});
  const [selectedWorks, setSelectedWorks] = useState(new Set());
  const [activeJobId, setActiveJobId] = useState(null);
  const [activeJobData, setActiveJobData] = useState(null);
  
  // Duplicate Handling Modal State
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);
  const [duplicateKeys, setDuplicateKeys] = useState([]);
  const [newKeys, setNewKeys] = useState([]);
  const [reviewingDuplicates, setReviewingDuplicates] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set());
  const [pendingWorksList, setPendingWorksList] = useState([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Auto-search on mount if query params exist
  useEffect(() => {
    const mode = searchParams.get('mode');                            
    
    if (mode === 'local') {
      const type = searchParams.get('type') || 'title';
      const query = searchParams.get('q') || '';
      
      setSearchMode('local');
      setLocalSearchType(type);
      setLocalSearchQuery(query);
      
      if (query) {
        executeLocalSearch(type, query);
      }
    } else if (searchParams.get('q') || searchParams.get('title') || searchParams.get('author') || searchParams.get('subject') || searchParams.get('language')) {
      executeOpenLibrarySearch(0, {
        q: searchParams.get('q') || '',
        t: searchParams.get('title') || '',
        a: searchParams.get('author') || '',
        s: searchParams.get('subject') || '',
        l: searchParams.get('language') || '',
      });
    }
  }, []); // Run only on mount

  // Auto-hide messages after 4 seconds (only for non-permanent messages, e.g., we might want to keep the final result a bit longer or let it auto-hide)
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

// Poll for active job completion
  useEffect(() => {
    let interval;

    if (!activeJobId) return;

    const joinImportJob = () => {
      socket.emit("join_import_job", activeJobId);
    };

    // Join immediately if already connected
    if (socket.connected) {
      joinImportJob();
    }

    // Join when Socket.IO connects/reconnects
    socket.on("connect", joinImportJob);

    // Handle real-time progress events
    const handleProgress = (data) => {
      if (data.jobId === activeJobId) {
        setActiveJobData((prev) => ({
          ...prev,
          status: data.status,
          processed_records: data.completed,
          total_records: data.total,
          successful_records: data.imported,
          updated_records: data.updated,
          failed_records: data.failed
        }));
      }
    };

    const handleCompleted = (data) => {
      if (data.jobId === activeJobId) {
        setActiveJobData((prev) => ({
          ...prev,
          status: data.status,
          processed_records: data.completed,
          total_records: data.total,
          successful_records: data.imported,
          updated_records: data.updated,
          failed_records: data.failed
        }));
        clearInterval(interval);
        setActiveJobId(null);
      }
    };

    const handleFailed = (data) => {
      if (data.jobId === activeJobId) {
        setActiveJobData((prev) => ({
          ...prev,
          status: data.status,
          error: data.error
        }));
        clearInterval(interval);
        setActiveJobId(null);
      }
    };

    socket.on("import_progress", handleProgress);
    socket.on("import_completed", handleCompleted);
    socket.on("import_failed", handleFailed);

    // Fetch immediately once
    const fetchJob = async () => {
      try {
        const response = await axios.get(`/api/books/import/jobs/${activeJobId}`);

        if (response.data.success) {
          const job = response.data.data;

          setActiveJobData(job);

          if (
            job &&
            (
              job.status === 'completed' ||
              job.status === 'partially_completed' ||
              job.status === 'failed'
            )
          ) {
            clearInterval(interval);
            setActiveJobId(null);
          }
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    };

    fetchJob();
    // Preserve polling as fallback per instructions
    interval = setInterval(fetchJob, 1000);

    return () => {
      clearInterval(interval);
      socket.off("connect", joinImportJob);
      socket.off("import_progress", handleProgress);
      socket.off("import_completed", handleCompleted);
      socket.off("import_failed", handleFailed);
    };
  }, [activeJobId]);

  const executeOpenLibrarySearch = async (currentOffset = 0, overrideParams = null) => {
    const queryQ = overrideParams?.q ?? q;
    const t = overrideParams?.t ?? title;
    const a = overrideParams?.a ?? author;
    const s = overrideParams?.s ?? subject;
    const l = overrideParams?.l ?? language;

    if (!queryQ && !t && !a && !s && !l) return;

    setIsSearching(true);
    setMessage(null);
    setSelectedWorks(new Set());
    setSearchMode('openlibrary');
    
    try {
      const response = await axios.get('/api/books/search', {
        params: { q: queryQ, title: t, author: a, subject: s, language: l, limit: searchLimit, offset: currentOffset }
      });
      if (response.data.success) {
        setResults(response.data.data.results || []);
        setTotal(response.data.data.total || 0);
        setOffset(currentOffset);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to search Open Library.' });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const executeLocalSearch = async (overrideType = null, overrideQuery = null) => {
    const typeToUse = overrideType || localSearchType;
    const queryToUse = overrideQuery || localSearchQuery;
    
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    setMessage(null);
    setSelectedWorks(new Set());
    setSearchMode('local');
    
    try {
      const response = await axios.get('/api/books/catalog', {
        params: { [typeToUse]: queryToUse, limit: 100 }
      });
      if (response.data.success) {
        const fetchedResults = response.data.data.results || [];
        setResults(fetchedResults);
        setTotal(fetchedResults.length);
        setOffset(0);
        if (fetchedResults.length === 0) {
          setMessage({ type: 'error', text: 'No local records found.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to search Local Library.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || `Failed to search Local Library by ${localSearchType}.` });
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchMode === 'openlibrary') {
      executeOpenLibrarySearch(0);
    } else {
      executeLocalSearch();
    }
  };

  const handleNextPage = () => {
    if (searchMode === 'openlibrary') executeOpenLibrarySearch(offset + searchLimit);
    // Note: Local search currently doesn't implement pagination in the backend
  };

  const handlePrevPage = () => {
    if (searchMode === 'openlibrary' && offset >= searchLimit) {
      executeOpenLibrarySearch(offset - searchLimit);
    }
  };

  // --- Import Logic (Open Library only) ---
  const toggleSelection = (key) => {
    setSelectedWorks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWorks.size === results.length) {
      setSelectedWorks(new Set());
    } else {
      setSelectedWorks(new Set(results.map(w => w.key)));
    }
  };

  const handleSingleImport = async (workKey) => {
    setImportingWorks(prev => ({ ...prev, [workKey]: true }));
    try {
      const cleanKey = workKey.replace('/works/', '');
      const response = await axios.post(`/api/books/import/${cleanKey}`);
      if (response.data.success) {
        if (response.data.data?.status === 'duplicate') {
          setMessage({ type: 'error', text: 'Already Imported — This book is already in your library.' });
        } else {
          setMessage({ type: 'success', text: 'Work imported successfully!' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import book.' });
    } finally {
      setImportingWorks(prev => ({ ...prev, [workKey]: false }));
    }
  };

  const initiateImportSelected = async () => {
    if (selectedWorks.size === 0) return;
    setIsBatchImporting(true); // Show loader on button while checking
    
    const workKeys = Array.from(selectedWorks).map(k => k.replace('/works/', ''));
    
    try {
      const res = await axios.post('/api/books/existing-works', { workKeys });
      if (res.data.success) {
        const dupesArray = res.data.data.existingWork || [];
        const dupes = dupesArray.map(d => d.open_library_work_key);
        const newSet = workKeys.filter(k => !dupes.includes(k));
        
        if (dupes.length === 0) {
          // No duplicates, bypass prompt
          importPasser(workKeys, results);
        } else {
          // Present duplicate UI
          setDuplicateKeys(dupes);
          setNewKeys(newSet);
          setPendingWorksList(results);
          setIsBatchMode(false);
          setReviewingDuplicates(false);
          setSelectedDuplicates(new Set());
          setShowDuplicatePrompt(true);
          setIsBatchImporting(false); // Hide button loader, show modal
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to pre-check duplicates.' });
      setIsBatchImporting(false);
    }
  };

  const importPasser = async (finalCleanKeys, worksList = results) => {
    setShowDuplicatePrompt(false);
    setReviewingDuplicates(false);
    
    if (finalCleanKeys.length === 0) {
      setMessage({ type: 'success', text: 'All selected books are already in your library. Nothing to import.' });
      return;
    }
    
    setIsBatchImporting(true);
    
    const keysSet = new Set(finalCleanKeys);
    const worksToImport = worksList
      .filter(w => keysSet.has(w.key.replace('/works/', '')))
      .map(w => ({
        key: w.key,
        title: w.title,
        language: w.language || []
      }));

    try {
      const response = await axios.post('/api/books/import/selected', { works: worksToImport });
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Import job started successfully. Waiting for completion...' });
        setSelectedWorks(new Set());

        if (response.data.data?.jobId) {


          setActiveJobId(response.data.data.jobId);
          setActiveJobData(null); 
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start import job.' });
      console.error("Failed to import", error);
    } finally {
      setIsBatchImporting(false);
    }
  };

  const handleUpdateAll = () => importPasser([...newKeys, ...duplicateKeys], pendingWorksList);
  const handleSkipAll = () => importPasser(newKeys, pendingWorksList);
  const handleReviewDuplicates = () => setReviewingDuplicates(true);
  const handleImportReviewed = () => importPasser([...newKeys, ...Array.from(selectedDuplicates)], pendingWorksList);

  const handleBatchImport = async () => {
    if (!q && !title && !author && !subject && !language) return;
    setIsBatchImporting(true);
    setShowDuplicatePrompt(false);
    
    try {
      // 1. Fetch batchLimit results from OpenLibrary search API directly
      const searchRes = await axios.get('/api/books/search', {
        params: { q, title, author, subject, language, limit: batchLimit, offset: 0 }
      });
      
      const fetchedResults = searchRes.data?.data?.results || [];
      if (fetchedResults.length === 0) {
        setMessage({ type: 'error', text: 'No books found to import.' });
        setIsBatchImporting(false);
        return;
      }
      
      const workKeys = fetchedResults.map(w => w.key.replace('/works/', ''));
      
      // 2. Check for duplicates in the fetched batch
      const dupeRes = await axios.post('/api/books/existing-works', { workKeys });
      if (dupeRes.data.success) {
        const dupesArray = dupeRes.data.data.existingWork || [];
        const dupes = dupesArray.map(d => d.open_library_work_key);
        const newSet = workKeys.filter(k => !dupes.includes(k));
        
        if (dupes.length === 0) {
          importPasser(workKeys, fetchedResults);
        } else {
          setDuplicateKeys(dupes);
          setNewKeys(newSet);
          setPendingWorksList(fetchedResults);
          setIsBatchMode(true);
          setReviewingDuplicates(false);
          setSelectedDuplicates(new Set());
          setShowDuplicatePrompt(true);
          setIsBatchImporting(false);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to start batch import.' });
      setIsBatchImporting(false);
    }
  };

  const handleAutoFetchNewBooks = async () => {
    setShowDuplicatePrompt(false);
    setIsBatchImporting(true);
    let accumulatedNewWorks = pendingWorksList.filter(w => newKeys.includes(w.key.replace('/works/', '')));
    let currentOffset = pendingWorksList.length;
    
    try {
      while (accumulatedNewWorks.length < batchLimit) {
        const needed = batchLimit - accumulatedNewWorks.length;
        
        const searchRes = await axios.get('/api/books/search', {
          params: { q, title, author, subject, language, limit: needed, offset: currentOffset }
        });
        
        const chunk = searchRes.data?.data?.results || [];
        if (chunk.length === 0) break;
        
        currentOffset += chunk.length;
        
        const chunkKeys = chunk.map(w => w.key.replace('/works/', ''));
        const dupeRes = await axios.post('/api/books/existing-works', { workKeys: chunkKeys });
        
        if (dupeRes.data.success) {
          const dupesArray = dupeRes.data.data.existingWork || [];
          const dupes = dupesArray.map(d => d.open_library_work_key);
          const newChunkKeys = chunkKeys.filter(k => !dupes.includes(k));
          
          const newChunkWorks = chunk.filter(w => newChunkKeys.includes(w.key.replace('/works/', '')));
          accumulatedNewWorks = [...accumulatedNewWorks, ...newChunkWorks];
        } else {
          break;
        }
      }
      
      accumulatedNewWorks = accumulatedNewWorks.slice(0, batchLimit);
      const finalKeys = accumulatedNewWorks.map(w => w.key.replace('/works/', ''));
      importPasser(finalKeys, accumulatedNewWorks);
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to auto-fetch new books.' });
      setIsBatchImporting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Book Search</h1>
        <p className="page-subtitle">Find and explore books across local and external libraries.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button 
          onClick={() => { setSearchMode('openlibrary'); setResults([]); setTotal(0); setMessage(null); setHasSearched(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
            backgroundColor: searchMode === 'openlibrary' ? 'var(--primary)' : 'transparent',
            color: searchMode === 'openlibrary' ? '#fff' : 'var(--text-secondary)',
            fontWeight: searchMode === 'openlibrary' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <BookOpen size={18} /> Open Library
        </button>
        <button 
          onClick={() => { setSearchMode('local'); setResults([]); setTotal(0); setMessage(null); setHasSearched(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
            backgroundColor: searchMode === 'local' ? 'var(--primary)' : 'transparent',
            color: searchMode === 'local' ? '#fff' : 'var(--text-secondary)',
            fontWeight: searchMode === 'local' ? 600 : 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Library size={18} /> My Library
        </button>
      </div>

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

      {showDuplicatePrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ padding: '32px', width: '100%', maxWidth: reviewingDuplicates ? '600px' : '400px', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Duplicate Handling</h3>
            
            {!reviewingDuplicates ? (
              <>
                <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {newKeys.length + duplicateKeys.length} books targeted — {newKeys.length} new, <strong style={{ color: 'var(--error)' }}>{duplicateKeys.length} already imported.</strong><br/><br/>
                  How would you like to handle the books that already exist in your local library?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '44px' }} onClick={handleUpdateAll}>Import All {newKeys.length + duplicateKeys.length} Books (Update Duplicates)</button>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', height: '44px', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={handleSkipAll}>Import New {newKeys.length} Books (Skipping Duplicates)</button>
                  
                  {isBatchMode && (
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', height: '44px', backgroundColor: 'var(--primary)', color: 'white' }} onClick={handleAutoFetchNewBooks}>
                      Import New Books Only (Auto-fill to {batchLimit})
                    </button>
                  )}
                  
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', height: '44px' }} onClick={handleReviewDuplicates}>Review Duplicates ({duplicateKeys.length})</button>
                  <button onClick={() => setShowDuplicatePrompt(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '12px', fontSize: '15px', textDecoration: 'underline' }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  Select the existing books you want to update. Unselected books will be skipped.
                </p>
                <div style={{ overflowY: 'auto', flex: 1, marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  {duplicateKeys.map(key => {
                    const work = results.find(w => w.key.includes(key));
                    if (!work) return null;
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedDuplicates.has(key)} 
                          onChange={(e) => {
                            const newSet = new Set(selectedDuplicates);
                            if (e.target.checked) newSet.add(key); else newSet.delete(key);
                            setSelectedDuplicates(newSet);
                          }}
                          style={{ marginRight: '16px', width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{work.title}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Key: {key}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setReviewingDuplicates(false)}>Back</button>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleImportReviewed}>
                    Import {newKeys.length + selectedDuplicates.size} Books
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Banner */}
      {activeJobData && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px', border: activeJobData.status === 'completed' ? '1px solid var(--success)' : activeJobData.status === 'failed' ? '1px solid var(--error)' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {activeJobData.status === 'completed' || activeJobData.status === 'partially_completed' || activeJobData.status === 'failed'
                ? `Import complete — ${activeJobData.processed_records} / ${activeJobData.total_records} books`
                : `Importing ${activeJobData.processed_records} / ${activeJobData.total_records} books...`}
            </h3>
            {(activeJobData.status === 'completed' || activeJobData.status === 'partially_completed' || activeJobData.status === 'failed') && (
              <button 
                onClick={() => setActiveJobData(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
              >
                Dismiss
              </button>
            )}
          </div>
          
          <div style={{ height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ 
              width: `${activeJobData.total_records > 0 ? (activeJobData.processed_records / activeJobData.total_records) * 100 : 0}%`, 
              height: '100%', 
              backgroundColor: activeJobData.status === 'failed' ? 'var(--error)' : activeJobData.status === 'completed' ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>{activeJobData.successful_records} Imported</span>
            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{activeJobData.updated_records} Updated</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{activeJobData.skipped_records} Skipped</span>
            <span style={{ color: 'var(--error)', fontWeight: 500 }}>{activeJobData.failed_records} Failed</span>
            <span style={{ color: '#F59E0B', fontWeight: 500 }}>{activeJobData.duplicate_records} Duplicate</span>
          </div>
        </div>
      )}

      {/* Search Forms */}
      <div className="card" style={{ marginBottom: '32px' }}>
        {searchMode === 'openlibrary' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={() => setAdvancedMode(!advancedMode)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                {advancedMode ? 'Use General Search' : 'Use Advanced Search'}
              </button>
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {!advancedMode ? (
                <div style={{ flex: '1 1 300px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>General Search</label>
                  <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} placeholder="Search by anything..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              ) : (
                <>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Title</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Author</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={author} onChange={(e) => setAuthor(e.target.value)} />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Subject</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Language (ISO)</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '15px' }} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="eng" />
                  </div>
                </>
              )}
              

              <button type="submit" className="btn-primary" disabled={isSearching || (!q && !title && !author && !subject && !language)} style={{ height: '42px', flex: '0 0 auto' }}>
                {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
                Search
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={localSearchType}
              onChange={(e) => setLocalSearchType(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer', height: '42px' }}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="language">Language Code</option>
              <option value="subject">Subject</option>
              <option value="year">Publish Year</option>
            </select>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder={`Search local catalog by ${localSearchType}...`}
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'var(--font-sans)', outline: 'none', height: '42px' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSearching || !localSearchQuery.trim()} style={{ height: '42px', flex: '0 0 auto' }}>
              {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
              Search Local
            </button>
          </form>
        )}
      </div>

      {/* Results */}
      {isSearching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      ) : results.length > 0 ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Results ({total} found)</h2>
            
            {searchMode === 'openlibrary' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={toggleSelectAll}>
                  <CheckSquare size={16} /> {selectedWorks.size === results.length ? 'Deselect All' : 'Select All'}
                </button>
                <button 
                  className="btn-primary" 
                  onClick={initiateImportSelected} 
                  disabled={selectedWorks.size === 0 || isBatchImporting}
                >
                  {isBatchImporting && selectedWorks.size > 0 ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                  Import Selected ({selectedWorks.size})
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
                  <input 
                    type="number" 
                    value={batchLimit} 
                    onChange={e => setBatchLimit(Number(e.target.value))} 
                    style={{ width: '70px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px' }} 
                    min="1" 
                    max="1000"
                  />
                  <button className="btn-secondary" onClick={handleBatchImport} disabled={isBatchImporting}>
                    {isBatchImporting && selectedWorks.size === 0 ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                    Batch Import Top
                  </button>
                </div>
              </div>
            )}
          </div>



          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {results.map((work) => {
              const cleanKey = work.key.replace('/works/', '');
              return (
                <div 
                  key={work.key} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '16px', 
                    gap: '16px',
                    borderColor: searchMode === 'openlibrary' && selectedWorks.has(work.key) ? 'var(--primary)' : 'var(--border)',
                    boxShadow: searchMode === 'openlibrary' && selectedWorks.has(work.key) ? '0 0 0 1px var(--primary)' : '0 4px 12px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                    {searchMode === 'openlibrary' && (
                      <input 
                        type="checkbox"
                        checked={selectedWorks.has(work.key)}
                        onChange={() => toggleSelection(work.key)}
                        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    )}
                    {work.cover_i ? (
                      <img src={`${import.meta.env.VITE_OPENLIBRARY_COVERS_URL}/${work.cover_i}-M.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: searchMode === 'local' ? 'pointer' : 'default' }} onClick={() => searchMode === 'local' && navigate(`/books/${cleanKey}`)} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: searchMode === 'local' ? 'pointer' : 'default' }} onClick={() => searchMode === 'local' && navigate(`/books/${cleanKey}`)}>No Cover</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Link to={`/books/${cleanKey}`} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {work.title}
                    </Link>
                    {searchMode === 'openlibrary' && (
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{work.author_name?.join(', ') || 'Unknown Author'}</p>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Published: {work.first_publish_year || 'Unknown'}</p>
                    
                    {searchMode === 'openlibrary' && (
                      <button 
                        className="btn-primary"
                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                        onClick={() => handleSingleImport(work.key)}
                        disabled={importingWorks[work.key] || isBatchImporting}
                      >
                        {importingWorks[work.key] ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Import to Library'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {searchMode === 'openlibrary' && total > searchLimit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button 
                className="btn-secondary" 
                onClick={handlePrevPage} 
                disabled={offset === 0 || isSearching}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {Math.floor(offset / searchLimit) + 1} of {Math.ceil(total / searchLimit)}
              </span>
              <button 
                className="btn-secondary" 
                onClick={handleNextPage} 
                disabled={offset + searchLimit >= total || isSearching}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : hasSearched ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>No records found</h3>
          <p style={{ margin: 0, fontSize: '15px' }}>Try adjusting your search words or filtering by a different criteria.</p>
        </div>
      ) : null}
    </div>
  );
}
