import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm px-4 sticky-top">
      
      {/* Logo on the far left */}
      <Link to={user ? "/dashboard" : "/"} className="navbar-brand fw-bold fs-4 me-4">
        🕌 Muslim Jama'aa
      </Link>
      
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        
        {/* LEFT MENU: Dashboard, About, Library (Only if logged in) */}
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
          {user && <li className="nav-item"><Link to="/dashboard" className="nav-link text-white">Dashboard</Link></li>}
          <li className="nav-item"><Link to="/about" className="nav-link text-white">About Jama'aa</Link></li>
          {user && <li className="nav-item"><Link to="/books" className="nav-link text-white">📚 Library</Link></li>}
        </ul>

        {/* RIGHT SIDE: Login/Register OR User Profile */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {!user && (
            <>
              <Link to="/" className="btn btn-outline-light btn-sm px-3">Login</Link>
              <Link to="/register" className="btn btn-light text-success btn-sm fw-bold px-3">Register</Link>
            </>
          )}
          
          {user && <span className="text-white fw-semibold me-3">Welcome, {user.fullName}</span>}
          
          {user?.role === 'student' && <Link to="/profile" className="btn btn-outline-light btn-sm">👤 Profile</Link>}
          {user?.role === 'ustaz' && <Link to="/ustaz" className="btn btn-outline-light btn-sm">🎓 My Students</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="btn btn-warning btn-sm fw-bold text-dark">⚙️ Admin Panel</Link>}
          
          {user && <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>}
        </div>
      </div>
    </nav>
  );
}