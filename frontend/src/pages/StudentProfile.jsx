import { useEffect, useState } from 'react';
import api from '../api';

export default function StudentProfile() {
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/students/me').then(r => setData(r.data.profile)); }, []);

  const save = async () => {
    await api.put('/students/me', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;
  const set = (k, v) => setData({ ...data, [k]: v });

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <h3 className="fw-bold text-success mb-4">👤 My Profile</h3>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Phone Number</label>
            <input className="form-control" value={data.phone || ''} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Region</label>
            <input className="form-control" value={data.region || ''} onChange={e => set('region', e.target.value)} />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Zone</label>
              <input className="form-control" value={data.zone || ''} onChange={e => set('zone', e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">City</label>
              <input className="form-control" value={data.city || ''} onChange={e => set('city', e.target.value)} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Islamic Education</label>
              <select className="form-select" value={data.islamicEducationStatus} onChange={e => set('islamicEducationStatus', e.target.value)}>
                <option value="none">None</option><option value="madrasa">Madrasa</option>
                <option value="hifz">Hifz</option><option value="alim">Alim</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Qur'an Level</label>
              <select className="form-select" value={data.quranLevel} onChange={e => set('quranLevel', e.target.value)}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option>
                <option value="hafiz">Hafiz</option>
              </select>
            </div>
          </div>

          <button onClick={save} className="btn btn-success w-100 fw-bold mt-3">Save Profile</button>
          {saved && <div className="alert alert-success mt-3 py-2 text-center">Profile Saved Successfully!</div>}
        </div>
      </div>
    </div>
  );
}