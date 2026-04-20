import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const formatUrl = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const Research = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('developer'));

    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await axios.post('http://localhost:5000/api/research/search', {
        query,
        developer_id: user?.developer_id
      });

      setResults(response.data.results || []);
      setMeta({
        optimizedQuery: response.data.optimizedQuery,
        quota: response.data.quota,
        llmModel: response.data.llmModel,
        cached: response.data.cached
      });
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.error || 'Failed to run web research. Check Tavily and the local Windows LLM service.');
      setMeta(requestError.response?.data?.quota ? { quota: requestError.response.data.quota } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const panelStyle = {
    backgroundColor: '#1e293b',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #334155'
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '1rem',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const resultCardStyle = {
    ...panelStyle,
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
    gap: '1.5rem',
    alignItems: 'start'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#f8fafc', marginBottom: '0.5rem', fontSize: '2rem' }}>Web Research</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '760px', lineHeight: '1.6' }}>
            Search external technical sources, scrape the top three links, and get quick summaries from your Windows-hosted local LLM before digging deeper.
          </p>
        </div>

        <div style={{ ...panelStyle, marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', color: '#f8fafc', fontWeight: 'bold' }}>Research Prompt</label>
              <textarea
                placeholder="e.g., CAP Node.js multitenancy deployment best practices"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.6', flex: 1, minWidth: '260px' }}>
                The backend uses Tavily for discovery, scrapes only the top three links, and summarizes them with <strong style={{ color: '#f8fafc' }}>qwen2.5:3b-instruct</strong> on Windows.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                style={{ padding: '0.875rem 1.5rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
              >
                {isLoading ? 'Researching...' : 'Run Research'}
              </button>
            </div>
          </form>
        </div>

        {(meta || error) && (
          <div style={{ ...panelStyle, marginBottom: '2rem', backgroundColor: '#0f172a' }}>
            <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Research Status</h2>
            {meta?.optimizedQuery && <p style={{ color: '#cbd5e1', marginTop: 0 }}><strong style={{ color: '#f8fafc' }}>Optimized query:</strong> {meta.optimizedQuery}</p>}
            {meta?.llmModel && <p style={{ color: '#cbd5e1' }}><strong style={{ color: '#f8fafc' }}>Local summary model:</strong> {meta.llmModel}</p>}
            {typeof meta?.cached === 'boolean' && <p style={{ color: '#cbd5e1' }}><strong style={{ color: '#f8fafc' }}>Cache:</strong> {meta.cached ? 'Loaded from technical logs' : 'Fresh web research run'}</p>}
            {meta?.quota && <p style={{ color: '#cbd5e1', marginBottom: 0 }}><strong style={{ color: '#f8fafc' }}>Tavily quota guard:</strong> {meta.quota.remaining} searches remaining out of {meta.quota.limit} for {meta.quota.period}.</p>}
            {error && <p style={{ color: '#f87171', marginBottom: 0 }}>{error}</p>}
          </div>
        )}

        {isLoading && (
          <div style={panelStyle}>
            <p style={{ color: '#cbd5e1', margin: 0 }}>Searching the web, extracting page content, and generating local summaries...</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {results.map((result) => (
              <div key={result.url} style={resultCardStyle}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ color: result.extractionStatus === 'scraped' ? '#34d399' : '#fbbf24', fontWeight: 'bold' }}>
                      {result.extractionStatus === 'scraped' ? 'Scraped page summary' : 'Snippet-only fallback'}
                    </span>
                    {typeof result.researchScore === 'number' && (
                      <span style={{ color: '#94a3b8' }}>Score: {result.researchScore.toFixed(2)}</span>
                    )}
                  </div>

                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem', lineHeight: '1.4' }}>{result.title}</h3>
                  <p style={{ margin: '0.5rem 0', color: '#a78bfa', wordBreak: 'break-word' }}>{formatUrl(result.url)}</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: '0.4rem', color: '#f8fafc', backgroundColor: '#3b82f6', padding: '0.7rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Open Source
                  </a>
                  <p style={{ color: '#64748b', lineHeight: '1.6', marginTop: '1rem', marginBottom: 0, wordBreak: 'break-word' }}>{result.url}</p>
                </div>

                <div style={{ minWidth: 0 }}>
                  <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#e2e8f0', fontSize: '1rem' }}>Summary</h4>
                  <p style={{ color: '#cbd5e1', lineHeight: '1.75', marginTop: 0 }}>{result.summary}</p>
                  <h4 style={{ marginTop: '1.25rem', marginBottom: '0.75rem', color: '#e2e8f0', fontSize: '1rem' }}>Source excerpt</h4>
                  <p style={{ color: '#94a3b8', lineHeight: '1.65', marginTop: 0 }}>{result.excerpt}</p>
                  {result.searchSnippet && result.extractionStatus === 'snippet-only' && (
                    <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: 0 }}>
                      Search snippet: {result.searchSnippet}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Research;