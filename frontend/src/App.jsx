import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/StudentProfile';
import Books from './pages/Books';
import AdminPanel from './pages/AdminPanel';
import UstazDashboard from './pages/UstazDashboard';
import About from './pages/About';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
              <Route path="/ustaz" element={<ProtectedRoute roles={['ustaz']}><UstazDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}