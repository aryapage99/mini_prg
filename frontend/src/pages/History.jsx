import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const queryTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.35rem 0.7rem',
  borderRadius: '999px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  backgroundColor: '#1d4ed8',
  color: '#dbeafe'
};

const researchTagStyle = {
  ...queryTagStyle,
  backgroundColor: '#8b5cf6',
  color: '#f3e8ff'
};

const resultGridStyle = {
  display: 'grid',
  gap: '1rem',
  marginTop: '1rem'
};

const researchCardStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '1rem'
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('developer'));

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/history/${user.developer_id}`);
      setHistory(response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all your query history?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/history/clear/${user.developer_id}`);
      setHistory([]);
    } catch (err) {
      alert("Failed to clear history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderResearchResults = (item) => {
    const results = item.result_metadata?.results;

    if (!Array.isArray(results) || results.length === 0) {
      return <ReactMarkdown>{item.result_output}</ReactMarkdown>;
    }

    return (
      <div style={resultGridStyle}>
        {results.map((result, index) => (
          <div key={`${item.query_id}-${result.url}-${index}`} style={researchCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <a href={result.url} target="_blank" rel="noreferrer" style={{ color: '#c4b5fd', fontWeight: 'bold', textDecoration: 'none', lineHeight: '1.5' }}>
                {result.title}
              </a>
              <span style={{ color: result.extractionStatus === 'scraped' ? '#34d399' : '#fbbf24', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {result.extractionStatus === 'scraped' ? 'Scraped' : 'Snippet cache'}
              </span>
            </div>
            <p style={{ color: '#a78bfa', marginTop: 0, marginBottom: '0.75rem' }}>{result.domain}</p>
            <p style={{ color: '#e2e8f0', lineHeight: '1.7', marginTop: 0 }}>{result.summary}</p>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: 0 }}>{result.excerpt}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: '#f8fafc', fontSize: '2rem', marginBottom: '0.5rem' }}>Technical Logs</h1>
            <p style={{ color: '#94a3b8' }}>Review your past interactions with the SAP CAP Assistant.</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Clear All History
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading historical data...</p>
        ) : history.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No history found. Your query and research activity will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {history.map((item) => (
              <div key={item.query_id} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={item.entry_type === 'research' ? researchTagStyle : queryTagStyle}>
                        {item.entry_type === 'research' ? 'Research' : 'Query'}
                      </span>
                    </div>
                    <span style={{ color: item.entry_type === 'research' ? '#c4b5fd' : '#60a5fa', fontWeight: 'bold' }}>
                      {item.entry_type === 'research' ? 'Research Prompt' : 'Query'}: {item.query_text}
                    </span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {item.entry_type === 'research' ? renderResearchResults(item) : <ReactMarkdown>{item.result_output}</ReactMarkdown>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;