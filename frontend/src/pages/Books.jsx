import { useEffect, useState } from 'react';
import api from '../api';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => { api.get('/books').then(r => setBooks(r.data)); }, []);

  const download = async (id, title) => {
    const res = await api.get(`/books/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `${title}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filtered = books.filter(b =>
    (b.title || '').toLowerCase().includes(q.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold text-success mb-4">📚 Islamic Library</h2>
      
      <div className="input-group mb-4 shadow-sm" style={{ maxWidth: '500px' }}>
        <span className="input-group-text bg-white border-end-0">🔍</span>
        <input type="text" className="form-control border-start-0" placeholder="Search by title or author..." 
          value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Changed to g-3 for smaller gaps, and using col-lg-2 / col-xl-2 for smaller cards */}
      <div className="row g-3">
        {filtered.map(b => (
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={b._id}>
            <div className="card h-100 shadow-sm border-0 rounded-3 hover-shadow transition-all">
              
              {/* Smaller Image Height (180px instead of 250px) */}
              {b.coverImage ? (
                <img 
                  src={`http://localhost:5000/api/books/${b._id}/cover`} 
                  className="card-img-top rounded-top-3 object-fit-cover" 
                  style={{ height: '180px' }} 
                  alt={b.title} 
                />
              ) : (
                <div className="card-img-top rounded-top-3 bg-secondary d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                  <span className="text-white fs-3">📖</span>
                </div>
              )}
              
              <div className="card-body d-flex flex-column p-2">
                <h6 className="card-title fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>
                  {b.title}
                </h6>
                <p className="card-text text-muted mb-1 text-truncate" style={{ fontSize: '0.75rem' }}>
                  {b.author || 'Unknown'}
                </p>
                
                <div className="mt-auto pt-2">
                  <button onClick={() => download(b._id, b.title)} className="btn btn-success w-100 fw-bold" style={{ fontSize: '0.75rem', padding: '4px' }}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted mt-5">No books found.</p>}
    </div>
  );
}