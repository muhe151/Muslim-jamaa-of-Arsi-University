import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    api.get('/news')
      .then(res => {
        if (Array.isArray(res.data)) {
          setNews(res.data);
        } else {
          setNews([]);
        }
      })
      .catch(() => setNews([]));
  }, []);

    const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setIsLoading(true);
    try { 
      await login(form.email, form.password); 
      nav('/dashboard'); 
    }
    catch (e) { 
      console.error(e); // Show in console
      
      // FORCE AN ALERT TO SEE THE EXACT ERROR
      const errorMessage = e.response?.data?.message || e.message || 'Login failed';
      alert("LOGIN ERROR: " + errorMessage); 
      
      setErr(errorMessage); 
      setIsLoading(false);
    }
  };
  return (
    <div className="container mt-4 mb-5">
      
      {/* TOP HEADER: Hero Slider */}
      <div id="loginSlider" className="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden mb-4" data-bs-ride="carousel" data-bs-interval="3000">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#loginSlider" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#loginSlider" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#loginSlider" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner" style={{ height: '250px' }}>
          <div className="carousel-item active h-100">
            <img src="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=2000&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Masjid" />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-2 mb-3">
              <h5 className="fw-bold mb-0">Welcome to Arsi University</h5>
            </div>
          </div>
          <div className="carousel-item h-100">
            <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2000&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Students" />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-2 mb-3">
              <h5 className="fw-bold mb-0">Seekers of Knowledge</h5>
            </div>
          </div>
          <div className="carousel-item h-100">
            <img src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2000&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Library" />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-2 mb-3">
              <h5 className="fw-bold mb-0">Islamic Library</h5>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#loginSlider" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#loginSlider" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* MAIN SPLIT SECTION */}
      <div className="row">
        
        {/* LEFT SIDE: Login Form */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-lg border-0 rounded-4 h-100">
            <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-center bg-white">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-success">🕌 Muslim Jama'aa</h3>
                <p className="text-muted">Arsi University Portal</p>
              </div>
              
              {err && <div className="alert alert-danger py-2 text-center shadow-sm">{err}</div>}
              
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address</label>
                  <input type="email" className="form-control form-control-lg bg-light" placeholder="name@example.com" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold">Password</label>
                  <input type="password" className="form-control form-control-lg bg-light" placeholder="Enter password" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-success btn-lg w-100 fw-bold rounded-3 shadow-sm mb-3" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-success fw-bold text-decoration-none">Register here</Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: News & 4-Image Gallery */}
        <div className="col-lg-7 mb-4">
          
          {/* News Section */}
          {news.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-success mb-3">📢 Jama'aa News</h5>
              {news.map(n => (
                <div key={n._id} className="alert alert-success shadow-sm border-0 mb-2 py-2">
                  <h6 className="fw-bold mb-1">{n.title}</h6>
                  <p className="mb-0 small">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 4-Image Gallery Grid */}
          <div className="row g-3">
            
            <div className="col-sm-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <img src="https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop" className="card-img-top rounded-top-4 object-fit-cover" style={{ height: '160px' }} alt="Quran" />
                <div className="card-body p-3">
                  <h6 className="fw-bold text-success mb-1">Qur'anic Studies</h6>
                  <p className="small text-muted mb-0">Daily recitation and memorization.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=800&auto=format&fit=crop" className="card-img-top rounded-top-4 object-fit-cover" style={{ height: '160px' }} alt="Books" />
                <div className="card-body p-3">
                  <h6 className="fw-bold text-success mb-1">Kitab Circles</h6>
                  <p className="small text-muted mb-0">Deep study of Fiqh, Hadith, and Tafsir.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <img src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop" className="card-img-top rounded-top-4 object-fit-cover" style={{ height: '160px' }} alt="Mosque" />
                <div className="card-body p-3">
                  <h6 className="fw-bold text-success mb-1">Spiritual Gatherings</h6>
                  <p className="small text-muted mb-0">Weekly halaqas and congregational prayers.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <img src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=800&auto=format&fit=crop" className="card-img-top rounded-top-4 object-fit-cover" style={{ height: '160px' }} alt="Students" />
                <div className="card-body p-3">
                  <h6 className="fw-bold text-success mb-1">Community & Support</h6>
                  <p className="small text-muted mb-0">A supportive network for all Muslim students.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}