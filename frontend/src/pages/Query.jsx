import React, { useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';


const Query = () => {
  const [inputText, setInputText] = useState('');
  const [action, setAction] = useState('query');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    setResult('');

    // Retrieve the developer ID from local storage for history tracking [cite: 79]
    const user = JSON.parse(localStorage.getItem('developer'));
    const developer_id = user?.developer_id;

    try {
      // Connect to your local Node.js backend
      const response = await axios.post('http://localhost:5000/api/query/ask', {
        query: inputText,
        action: action, // Used for routing logic in the backend
        developer_id: developer_id
      });

      setResult(response.data.answer);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to reach the AI server. Check if the MacBook is connected.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '1rem', borderRadius: '8px', 
    border: '1px solid #334155', backgroundColor: '#0f172a', 
    color: '#f8fafc', outline: 'none', fontSize: '1rem',
    minHeight: '120px', resize: 'vertical', fontFamily: 'inherit'
  };

  const buttonStyle = {
    padding: '0.875rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', 
    border: 'none', borderRadius: '6px', cursor: 'pointer', 
    fontSize: '1rem', fontWeight: 'bold', transition: 'background-color 0.2s'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: '#f8fafc', marginBottom: '0.5rem', fontSize: '2rem' }}>Query Documentation</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Ask questions about SAP CAP and get instant answers from your local knowledge base.</p>

        <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', color: '#f8fafc', fontWeight: 'bold' }}>Select Action</label>
              <div style={{ display: 'flex', gap: '2rem', color: '#cbd5e1' }}>
                <label style={{ cursor: 'pointer' }}><input type="radio" value="query" checked={action === 'query'} onChange={(e) => setAction(e.target.value)} /> Query</label>
                <label style={{ cursor: 'pointer' }}><input type="radio" value="scrape" checked={action === 'scrape'} onChange={(e) => setAction(e.target.value)} /> Scrape</label>
                <label style={{ cursor: 'pointer' }}><input type="radio" value="summarize" checked={action === 'summarize'} onChange={(e) => setAction(e.target.value)} /> Summarize</label>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc', fontWeight: 'bold' }}>Your Question</label>
              <textarea 
                placeholder="e.g., How do I use the @sap/cds-dk to initialize a project?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? 'Consulting Local LLM...' : 'Ask Assistant'}
            </button>
          </form>
        </div>

        {(isLoading || result || error) && (
  <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '12px', border: '1px solid #3b82f6', borderLeft: '4px solid #3b82f6' }}>
    <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Assistant Response</h3>
    
    {isLoading && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Searching 2,758 documentation fragments...</p>}
    
    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
    
    {result && (
      <div className="markdown-container" style={{ color: '#f8fafc', lineHeight: '1.8' }}>
        <ReactMarkdown 
          components={{
            // This styles the code blocks specifically
            code({node, inline, className, children, ...props}) {
              return (
                <code style={{ 
                  backgroundColor: '#1e293b', 
                  padding: '0.2rem 0.4rem', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  display: inline ? 'inline' : 'block',
                  whiteSpace: inline ? 'normal' : 'pre-wrap',
                  margin: inline ? '0' : '1rem 0',
                  border: '1px solid #334155'
                }} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {result}
        </ReactMarkdown>
      </div>
    )}
  </div>
        )}
      </div>
    </Layout>
  );
};

export default Query;