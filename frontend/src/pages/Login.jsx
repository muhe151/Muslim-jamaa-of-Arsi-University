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

  useEffect(() => {
    // Fetch news from the backend
    api.get('/news').then(res => setNews(res.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await login(form.email, form.password); nav('/dashboard'); }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Slider */}
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
      </div>

      <div className="row">
        {/* Left: Login */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-5 d-flex flex-column justify-content-center bg-white">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-success">🕌 Muslim Jama'aa</h3>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              {err && <div className="alert alert-danger py-2 text-center">{err}</div>}
              
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address</label>
                  <input type="email" className="form-control bg-light" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold">Password</label>
                  <input type="password" className="form-control bg-light" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-success w-100 fw-bold py-2">Login</button>
              </form>
              
              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-success fw-bold text-decoration-none">Register here</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: News & Gallery */}
        <div className="col-lg-7 mb-4">
          
          {/* NEW: Latest News Section */}
          {news.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-success mb-3">📢 Jama'aa News & Announcements</h5>
              {news.map(n => (
                <div key={n._id} className="alert alert-success shadow-sm border-0 mb-2">
                  <h6 className="fw-bold mb-1">{n.title}</h6>
                  <p className="mb-0 small">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Gallery */}
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
          </div>
        </div>
      </div>
    </div>
  );
}