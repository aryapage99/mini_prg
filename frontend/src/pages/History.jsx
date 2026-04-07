import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

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
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No history found. Your technical queries will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {history.map((item) => (
              <div key={item.query_id} style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Query: {item.query_text}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <ReactMarkdown>{item.result_output}</ReactMarkdown>
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