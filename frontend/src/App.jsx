import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Query from './pages/Query'; // Import the new component
import Layout from '../src/components/Layout';
import History from './pages/History';

const PlaceholderPage = ({ title }) => (
  <Layout><div style={{ padding: '2rem' }}><h2>{title}</h2><p>Coming soon...</p></div></Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/query" element={<Query />} /> {/* Route added here */}
        <Route path="/history" element={<History />} />
        <Route path="/history" element={<PlaceholderPage title="Query History" />} />
      </Routes>
    </Router>
  );
}

export default App;