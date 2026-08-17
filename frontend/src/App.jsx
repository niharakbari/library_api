import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TopNavLayout from './components/Layout/TopNavLayout';
import Dashboard from './pages/Dashboard';
import BookSearch from './pages/BookSearch';
import MyLibrary from './pages/MyLibrary';
import BookDetails from './pages/BookDetails';
import ImportJobs from './pages/ImportJobs';
import JobLogs from './pages/JobLogs';
import Authors from './pages/Authors';
import Subjects from './pages/Subjects';
import Languages from './pages/Languages';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><TopNavLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<MyLibrary />} />
          <Route path="/search" element={<BookSearch />} />
          <Route path="/books/:workKey" element={<BookDetails />} />
          <Route path="/jobs" element={<ImportJobs />} />
          <Route path="/jobs/:jobId/logs" element={<JobLogs />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/languages" element={<Languages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
