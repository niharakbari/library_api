            {results.map((work) => (
              <div 
                key={work.key} 
                className="card" 
                onClick={() => navigate(`/books/${work.key.replace('/works/', '')}`)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
                  {work.cover_i ? (
                    <img src={`https://covers.openlibrary.org/b/id/${work.cover_i}-M.jpg`} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Cover</div>
                  )}
                </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Link to={`/books/${work.key.replace('/works/', '')}`} state={{ localBookId: work.id }} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {work.title}
                    </Link>
                    
                    {/* Author Edit UI */}
                    <div style={{ marginBottom: '4px' }}>
                      {editingAuthor === work.key ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px', flex: 1 }}
                            autoFocus
                          />
                          <button onClick={() => handleSaveAuthor(work.id)} disabled={savingEdit === `author-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                            {savingEdit === `author-${work.id}` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button onClick={() => setEditingAuthor(null)} disabled={savingEdit === `author-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <span>{work.author_name?.length > 0 ? work.author_name.join(', ') : 'Unknown Author'}</span>
                          <button 
                            onClick={(e) => { e.preventDefault(); setEditingAuthor(work.key); setEditingYear(null); setEditValue(work.author_name?.length > 0 ? work.author_name[0] : ''); }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                            title="Edit Author"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                      {editMessage.id === work.id && editMessage.text.includes('Author') && (
                        <div style={{ fontSize: '11px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '2px' }}>{editMessage.text}</div>
                      )}
                    </div>

                    {/* Year Edit UI */}
                    <div style={{ marginBottom: '8px' }}>
                      {editingYear === work.key ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px', width: '80px' }}
                            autoFocus
                          />
                          <button onClick={() => handleSaveYear(work.id)} disabled={savingEdit === `year-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}>
                            {savingEdit === `year-${work.id}` ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                          </button>
                          <button onClick={() => setEditingYear(null)} disabled={savingEdit === `year-${work.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span>Published: {work.first_publish_year || 'Unknown'}</span>
                          <button 
                            onClick={(e) => { e.preventDefault(); setEditingYear(work.key); setEditingAuthor(null); setEditValue(work.first_publish_year || ''); }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                            title="Edit Year"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                      {editMessage.id === work.id && editMessage.text.includes('Year') && (
                        <div style={{ fontSize: '11px', color: editMessage.type === 'error' ? 'var(--error)' : 'var(--success)', marginTop: '2px' }}>{editMessage.text}</div>
                      )}
                    {/* Review Badge */}
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: work.is_reviewed ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {work.is_reviewed ? '✓ Reviewed' : 'Not Reviewed'}
                      </span>
                    </div>
                  </div>
                  
                  {(work.subject?.length > 0 || work.language?.length > 0) && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {work.language?.slice(0, 2).map((lang, idx) => (
                        <span key={`lang-${idx}`} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#E5E5E5', borderRadius: '100px', color: 'var(--text-secondary)' }}>
                          {lang.toUpperCase()}
                        </span>
                      ))}
                      {work.subject?.slice(0, 2).map((sub, idx) => (
                        <span key={`sub-${idx}`} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '100px' }}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
