import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Query from './pages/Query';
import Research from './pages/Research';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/query" element={<Query />} />
        <Route path="/research" element={<Research />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;