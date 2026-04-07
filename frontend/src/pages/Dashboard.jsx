import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Dashboard = () => {
  const cardStyle = {
    backgroundColor: '#1e293b', 
    padding: '2rem', 
    borderRadius: '12px', 
    border: '1px solid #334155',
    flex: 1, 
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
          <h1 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '2.5rem' }}>Welcome to Your DOC Assistant</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Query, scrape, and explore SAP CAP documentation with an intelligent local-first system.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <h3 style={{ color: '#60a5fa', marginBottom: '1rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔍 Search & Query</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5', flex: 1 }}>Ask questions about SAP CAP documentation and get instant, AI-powered answers.</p>
            <Link to="/query" style={{ color: '#f8fafc', backgroundColor: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center' }}>Get Started</Link>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📚 Scrape Content</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5', flex: 1 }}>Extract and crawl documentation content with our intelligent scraper.</p>
            <Link to="/query" style={{ color: '#1e293b', backgroundColor: '#a78bfa', padding: '0.75rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center' }}>Start Scraping</Link>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: '#34d399', marginBottom: '1rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⏱️ View History</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5', flex: 1 }}>Access all your previous queries and scraping operations in one place.</p>
            <Link to="/history" style={{ color: '#1e293b', backgroundColor: '#34d399', padding: '0.75rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center' }}>View History</Link>
          </div>
        </div>

        {/* Quick Start Section */}
        <div style={{ backgroundColor: '#1e293b', padding: '2.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#f8fafc', fontSize: '1.2rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>How to Use</h3>
            <ol style={{ color: '#cbd5e1', lineHeight: '2', paddingLeft: '1.2rem', margin: 0 }}>
              <li>Navigate to Search</li>
              <li>Enter your query or content</li>
              <li>Choose action: Query, Scrape, or Summarize</li>
              <li>View results and history</li>
            </ol>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#f8fafc', fontSize: '1.2rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>Features</h3>
            <ul style={{ color: '#cbd5e1', lineHeight: '2', listStyleType: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#34d399' }}>✓</span> Local-first query processing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#34d399' }}>✓</span> AI-powered summaries</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#34d399' }}>✓</span> Smart document retrieval</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#34d399' }}>✓</span> Complete offline support</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;