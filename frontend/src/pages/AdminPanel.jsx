import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = ['Students', 'Books', 'Reports', 'Schedule', 'Finance', 'Complaints', 'News'];

export default function AdminPanel() {
  const [tab, setTab] = useState('Students');

  const DASHBOARD_CARDS = [
    { id: 'Students', icon: '👨‍🎓', color: 'primary', desc: 'Manage all registered students' },
    { id: 'Schedule', icon: '📅', color: 'success', desc: 'Semesters, Classes & Ustaz' },
    { id: 'Books', icon: '📚', color: 'warning', desc: 'Upload and manage PDF library' },
    { id: 'Reports', icon: '📊', color: 'info', desc: 'Export data and participation' },
    { id: 'Finance', icon: '💰', color: 'dark', desc: 'Donations and expenses' },
    { id: 'Complaints', icon: '📝', color: 'danger', desc: 'Read and reply to students' },
    { id: 'News', icon: '📢', color: 'secondary', desc: 'Post announcements' },
  ];

  return (
    <div className="container-fluid mt-4 px-4 mb-5">
      <h2 className="fw-bold text-success mb-4">⚙️ Admin Control Panel</h2>
      
      {/* VISUAL GALLERY DASHBOARD */}
      <div className="row g-3 mb-5">
        {DASHBOARD_CARDS.map(card => (
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={card.id}>
            <div 
              onClick={() => setTab(card.id)}
              className={`card h-100 shadow-sm border-0 rounded-4 text-center cursor-pointer transition-all hover-scale ${tab === card.id ? 'border-bottom border-4 border-' + card.color : ''}`}
              style={{ cursor: 'pointer', background: tab === card.id ? '#f8f9fa' : 'white' }}
            >
              <div className="card-body p-3">
                <div className={`fs-1 mb-2 text-${card.color}`}>{card.icon}</div>
                <h6 className="fw-bold mb-1 text-dark">{card.id}</h6>
                <p className="text-muted small mb-0" style={{ fontSize: '0.7rem' }}>{card.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h4 className="fw-bold mb-0 text-success text-capitalize">
            {DASHBOARD_CARDS.find(c => c.id === tab)?.icon} {tab}
          </h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setTab('Students')}>
            Back to Overview
          </button>
        </div>

        {tab === 'Students' && <AdminStudents />}
        {tab === 'Books' && <AdminBooks />}
        {tab === 'Reports' && <AdminReports />}
        {tab === 'Schedule' && <AdminSchedule />}
        {tab === 'Finance' && <AdminFinance />}
        {tab === 'Complaints' && <AdminComplaints />}
        {tab === 'News' && <AdminNews />}
      </div>
    </div>
  );
}

// --- STUDENTS TAB ---
function AdminStudents() {
  const [students, setStudents] = useState([]);
  useEffect(() => { api.get('/admin/students').then(r => setStudents(r.data)); }, []);

  const downloadFile = async (url, name) => {
    const res = await api.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = blobUrl; a.download = name; a.click();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Registered Students ({students.length})</h5>
        <div>
          <button className="btn btn-outline-success btn-sm me-2 fw-bold" onClick={() => downloadFile('/admin/students/export/csv', 'students.csv')}>Export CSV</button>
          <button className="btn btn-success btn-sm fw-bold" onClick={() => downloadFile('/admin/students/export/pdf', 'students.pdf')}>Export PDF</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Location</th><th>Quran</th><th>Islamic Ed.</th><th>Kitabs</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td className="fw-bold">{s.fullName}</td><td>{s.email}</td><td>{s.city}, {s.zone}</td>
                <td><span className="badge bg-info text-dark">{s.quranLevel}</span></td><td>{s.islamicEducationStatus}</td><td className="text-muted small">{s.kitabPreferences}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- BOOKS TAB ---
function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', category: '', file: null, cover: null });

  const load = () => api.get('/books').then(r => setBooks(r.data));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title); fd.append('author', form.author); fd.append('category', form.category);
    fd.append('file', form.file);
    if (form.cover) fd.append('cover', form.cover);
    await api.post('/books', fd);
    setForm({ title: '', author: '', category: '', file: null, cover: null });
    load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/books/${id}`); load(); };

  return (
    <div className="row">
      <div className="col-md-4">
        <h5 className="fw-bold mb-3">Upload New Book</h5>
        <form onSubmit={upload} className="bg-light p-3 rounded-3 border">
          <div className="mb-2"><input type="text" className="form-control" placeholder="Book Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="mb-2"><input type="text" className="form-control" placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
          <div className="mb-2"><input type="text" className="form-control" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
          <div className="mb-2">
            <label className="form-label small text-muted mb-1">Cover Image</label>
            <input type="file" className="form-control" accept="image/*" onChange={e => setForm({ ...form, cover: e.target.files[0] })} />
          </div>
          <div className="mb-3">
            <label className="form-label small text-muted mb-1">PDF File</label>
            <input type="file" className="form-control" accept="application/pdf" onChange={e => setForm({ ...form, file: e.target.files[0] })} required />
          </div>
          <button type="submit" className="btn btn-success w-100 fw-bold">Upload</button>
        </form>
      </div>
      <div className="col-md-8">
        <h5 className="fw-bold mb-3">Library ({books.length})</h5>
        <ul className="list-group shadow-sm">
          {books.map(b => (
            <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center gap-3">
                {b.coverImage ? <img src={`http://localhost:5000/api/books/${b._id}/cover`} alt="cover" style={{ width: '40px', height: '60px', objectFit: 'cover' }} /> : <div className="bg-secondary text-white p-3">📖</div>}
                <div><h6 className="mb-0 fw-bold">{b.title}</h6><small className="text-muted">{b.author}</small></div>
              </div>
              <button onClick={() => del(b._id)} className="btn btn-sm btn-outline-danger">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- REPORTS TAB ---
function AdminReports() {
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, activeStudents: 0, totalUstaz: 0, activeUstaz: 0 });

  useEffect(() => {
    api.get('/admin/grouped-assignments').then(r => setGroups(r.data));
    api.get('/admin/participation-report').then(r => setStats(r.data));
  }, []);

  const downloadPdf = async () => {
    const res = await api.get('/admin/grouped-assignments/pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'report.pdf'; a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6"><div className="card bg-success text-white border-0 shadow-sm rounded-4 mb-3"><div className="card-body"><h6 className="fw-bold text-white-50">Student Participation</h6><h3 className="mb-0">{stats.activeStudents} / {stats.totalStudents} Active</h3><small>Students assigned to an Ustaz</small></div></div></div>
        <div className="col-md-6"><div className="card bg-dark text-white border-0 shadow-sm rounded-4 mb-3"><div className="card-body"><h6 className="fw-bold text-white-50">Ustaz Participation</h6><h3 className="mb-0">{stats.activeUstaz} / {stats.totalUstaz} Active</h3><small>Ustaz teaching assigned students</small></div></div></div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Grouped Students Report</h5>
        <button className="btn btn-success fw-bold" onClick={downloadPdf}>📥 Download PDF</button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-success"><tr><th>Ustaz Name</th><th>Kitab Name</th><th>Student Name</th><th>Student Email</th></tr></thead>
          <tbody>
            {groups.map((group, gIndex) => (
              <React.Fragment key={gIndex}>
                {group.students.map((student, sIndex) => (
                  <tr key={sIndex}>
                    {sIndex === 0 && (<><td rowSpan={group.students.length} className="fw-bold text-success border-end">{group.ustazName}</td><td rowSpan={group.students.length} className="fw-bold border-end">{group.kitabName}</td></>)}
                    <td>{student.name}</td><td className="text-muted small">{student.email}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SCHEDULE TAB ---
function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [ustazList, setUstazList] = useState([]);
  
  const [editId, setEditId] = useState(null);
  
  const defaultForm = { 
    semester: 'Semester 1', 
    deadline: '', 
    targetKitab: 'Usuul', 
    sessionTime: '', 
    location: 'Ardu Campus', 
    masjidName: '', 
    ustaz: '' 
  };
  
  const [form, setForm] = useState(defaultForm);

  const KITABS = ['Usuul', 'Buluug', 'Qur\'aan', 'Tafsir', 'Riyaada', 'Al-Qaida'];
  const CAMPUSES = ['Ardu Campus', 'Dinsho Campus', 'Bokoji Campus', 'Health Campus'];

  const loadData = async () => {
    const [schedRes, studRes, ustazRes] = await Promise.all([
      api.get('/schedule'),
      api.get('/admin/students'),
      api.get('/ustaz/all')
    ]);
    setSchedules(schedRes.data);
    setStudents(studRes.data);
    setUstazList(ustazRes.data);
  };
  
  useEffect(() => { loadData(); }, []);

  const handleSubmitClass = async (e) => {
    e.preventDefault();
    const payload = { ...form, sessionDate: form.deadline };
    
    if (editId) {
      await api.put(`/schedule/${editId}`, payload);
      setEditId(null);
    } else {
      await api.post('/schedule', payload);
    }
    setForm(defaultForm);
    loadData();
  };

  const handleEditClick = (schedule) => {
    setEditId(schedule._id);
    const formattedDate = new Date(schedule.sessionDate).toISOString().split('T')[0];
    setForm({
      semester: schedule.semester,
      deadline: formattedDate,
      targetKitab: schedule.targetKitab,
      sessionTime: schedule.sessionTime,
      location: schedule.location,
      masjidName: schedule.masjidName || '',
      ustaz: schedule.ustaz?._id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    await api.delete(`/schedule/${id}`);
    loadData();
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-5">
          <div className={`card shadow-sm border-0 rounded-4 ${editId ? 'border-warning border-2' : ''}`}>
            <div className={`card-header fw-bold py-3 rounded-top-4 ${editId ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
              {editId ? '✏️ Edit Schedule' : '📅 Create Schedule'}
            </div>
            <div className="card-body bg-light">
              <form onSubmit={handleSubmitClass}>
                
                <div className="row mb-2">
                  <div className="col-6">
                    <label className="small fw-bold">Semester</label>
                    <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">Deadline</label>
                    <input type="date" className="form-control" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="small fw-bold">Target Kitab</label>
                  <select className="form-select" value={form.targetKitab} onChange={e => setForm({ ...form, targetKitab: e.target.value })}>
                    {KITABS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div className="row mb-2">
                  <div className="col-6">
                    <label className="small fw-bold">Campus</label>
                    <select className="form-select" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
                      {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">Permanent Time</label>
                    <input type="text" className="form-control" placeholder="e.g. 4:00 PM" value={form.sessionTime} onChange={e => setForm({ ...form, sessionTime: e.target.value })} required />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="small fw-bold">Masjid Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Masjid Usman" value={form.masjidName} onChange={e => setForm({ ...form, masjidName: e.target.value })} required />
                </div>

                <div className="mb-2">
                  <label className="small fw-bold">Assign Ustaz</label>
                  <select className="form-select" value={form.ustaz} onChange={e => setForm({ ...form, ustaz: e.target.value })}>
                    <option value="">Ustaz (Optional)</option>
                    {ustazList.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                  </select>
                </div>

                <div className="d-flex gap-2 mt-3">
                  {editId && <button type="button" onClick={() => { setEditId(null); setForm(defaultForm); }} className="btn btn-secondary w-50">Cancel</button>}
                  <button type="submit" className={`btn w-50 fw-bold ${editId ? 'btn-warning text-dark' : 'btn-success'}`}>{editId ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <h5 className="fw-bold mb-3 text-success border-bottom pb-2">Semester 1 Classes</h5>
          <div className="row g-3 mb-4">
            {schedules.filter(s => s.semester === 'Semester 1').map(s => {
              const kitabStudents = students.filter(st => st.kitabPreferences?.toLowerCase() === s.targetKitab?.toLowerCase());
              return (
                <div className="col-md-6" key={s._id}>
                  <div className="card shadow-sm border-0 h-100 border-start border-4 border-success">
                    <div className="card-body p-3 d-flex flex-column">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{s.semester} - {s.targetKitab}</h6>
                        <span className="badge bg-success">{s.sessionTime}</span>
                      </div>
                      <p className="small text-muted mb-1">📍 {s.location} | 🕌 {s.masjidName}</p>
                      <p className="small text-muted mb-2">🗓️ Deadline: {new Date(s.sessionDate).toLocaleDateString()}</p>
                      <div className="mb-3"><span className="badge bg-light text-dark border">Ustaz: {s.ustaz?.fullName || 'Pending'}</span></div>
                      <div className="mt-auto bg-light p-2 rounded border">
                        <strong className="small d-block mb-1">Students ({kitabStudents.length}):</strong>
                        <div className="d-flex flex-wrap gap-1">
                          {kitabStudents.length === 0 ? <span className="text-muted small">None</span> : kitabStudents.map(st => <span key={st.id} className="badge bg-white text-dark border">{st.fullName}</span>)}
                        </div>
                      </div>
                      <div className="mt-3 d-flex gap-2">
                        <button onClick={() => handleEditClick(s)} className="btn btn-sm btn-outline-primary w-50">✏️ Edit</button>
                        <button onClick={() => handleDeleteClass(s._id)} className="btn btn-sm btn-outline-danger w-50">🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {schedules.filter(s => s.semester === 'Semester 1').length === 0 && <p className="text-muted small px-2">No classes created.</p>}
          </div>

          <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">Semester 2 Classes</h5>
          <div className="row g-3">
            {schedules.filter(s => s.semester === 'Semester 2').map(s => {
              const kitabStudents = students.filter(st => st.kitabPreferences?.toLowerCase() === s.targetKitab?.toLowerCase());
              return (
                <div className="col-md-6" key={s._id}>
                  <div className="card shadow-sm border-0 h-100 border-start border-4 border-dark">
                    <div className="card-body p-3 d-flex flex-column">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{s.semester} - {s.targetKitab}</h6>
                        <span className="badge bg-dark">{s.sessionTime}</span>
                      </div>
                      <p className="small text-muted mb-1">📍 {s.location} | 🕌 {s.masjidName}</p>
                      <p className="small text-muted mb-2">🗓️ Deadline: {new Date(s.sessionDate).toLocaleDateString()}</p>
                      <div className="mb-3"><span className="badge bg-light text-dark border">Ustaz: {s.ustaz?.fullName || 'Pending'}</span></div>
                      <div className="mt-auto bg-light p-2 rounded border">
                        <strong className="small d-block mb-1">Students ({kitabStudents.length}):</strong>
                        <div className="d-flex flex-wrap gap-1">
                          {kitabStudents.length === 0 ? <span className="text-muted small">None</span> : kitabStudents.map(st => <span key={st.id} className="badge bg-white text-dark border">{st.fullName}</span>)}
                        </div>
                      </div>
                      <div className="mt-3 d-flex gap-2">
                        <button onClick={() => handleEditClick(s)} className="btn btn-sm btn-outline-primary w-50">✏️ Edit</button>
                        <button onClick={() => handleDeleteClass(s._id)} className="btn btn-sm btn-outline-danger w-50">🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {schedules.filter(s => s.semester === 'Semester 2').length === 0 && <p className="text-muted small px-2">No classes created.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FINANCE TAB ---
function AdminFinance() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pending, setPending] = useState([]);
  const [newAcc, setNewAcc] = useState({ name: '', description: '', isDonation: false });
  const [txn, setTxn] = useState({ account: '', type: 'income', amount: '', category: '', description: '', transactionDate: '' });

  const load = async () => {
    const [a, t, p] = await Promise.all([
      api.get('/finance/accounts'), 
      api.get('/finance/transactions'),
      api.get('/finance/pending')
    ]);
    setAccounts(a.data); 
    setTransactions(t.data);
    setPending(p.data);
  };
  useEffect(() => { load(); }, []);

  const addAccount = async (e) => { e.preventDefault(); await api.post('/finance/accounts', newAcc); setNewAcc({ name: '', description: '', isDonation: false }); load(); };
  const addTxn = async (e) => { e.preventDefault(); await api.post('/finance/transactions', { ...txn, amount: Number(txn.amount) }); setTxn({ account: '', type: 'income', amount: '', category: '', description: '', transactionDate: '' }); load(); };
  
  const approveDonation = async (id) => { await api.put(`/finance/approve/${id}`); load(); };
  const rejectDonation = async (id) => { if(confirm('Reject this donation?')) { await api.delete(`/finance/reject/${id}`); load(); } };

  return (
    <div className="row">
      {/* PENDING APPROVALS SECTION */}
      {pending.length > 0 && (
        <div className="col-12 mb-4">
          <div className="alert alert-warning border-warning shadow-sm">
            <h5 className="fw-bold mb-3">⏳ Pending Donation Approvals ({pending.length})</h5>
            <div className="row g-3">
              {pending.map(p => (
                <div className="col-md-6" key={p._id}>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">{p.account?.name}</h6>
                        <h5 className="text-success fw-bold mb-0">+{p.amount} ETB</h5>
                      </div>
                      <p className="small text-muted mb-2">From: {p.recordedBy?.fullName} ({p.recordedBy?.email})</p>
                                          {p.receiptImage ? (
                        <div className="mb-3 text-center bg-light rounded p-2">
                          <img src={`http://localhost:5000/uploads/receipts/${p.receiptImage}`} alt="Receipt" style={{ maxHeight: '150px', maxWidth: '100%' }} className="rounded border" />
                        </div>
                      ) : (
                        <div className="alert alert-secondary py-1 small text-center mb-3">
                          No screenshot uploaded
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <button onClick={() => approveDonation(p._id)} className="btn btn-sm btn-success w-50 fw-bold">✅ Approve</button>
                        <button onClick={() => rejectDonation(p._id)} className="btn btn-sm btn-outline-danger w-50 fw-bold">❌ Reject</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="col-md-6 mb-4">
        <h5 className="fw-bold mb-3">Create Account</h5>
        <form onSubmit={addAccount} className="bg-light p-3 rounded-3 border mb-4">
          <div className="mb-2"><input type="text" className="form-control" placeholder="Account Name" value={newAcc.name} onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} required /></div>
          <div className="mb-2"><input type="text" className="form-control" placeholder="Description" value={newAcc.description} onChange={e => setNewAcc({ ...newAcc, description: e.target.value })} /></div>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="donationCheck" checked={newAcc.isDonation} onChange={e => setNewAcc({ ...newAcc, isDonation: e.target.checked })} />
            <label className="form-check-label fw-bold text-success" htmlFor="donationCheck">Public Donation</label>
          </div>
          <button type="submit" className="btn btn-success w-100 fw-bold">Add Account</button>
        </form>
        
                <h5 className="fw-bold mb-3">All Accounts</h5>
        <div className="row">
          {accounts.map(a => (
            <div className="col-sm-6 mb-3" key={a._id}>
              <div className={`card border-0 shadow-sm rounded-4 ${a.isDonation ? 'bg-success text-white' : 'bg-dark text-white'}`}>
                <div className="card-body position-relative">
                  {/* Delete Button */}
                  <button 
                    onClick={async () => {
                      if (confirm('Delete this account and all its history? This cannot be undone.')) {
                        await api.delete(`/finance/accounts/${a._id}`);
                        load(); // Refresh the list
                      }
                    }} 
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                    style={{ width: '30px', height: '30px', padding: '0', lineHeight: '1' }}
                    title="Delete Account"
                  >
                    ×
                  </button>

                  <h6 className="fw-bold text-white-50 pe-4">{a.name} {a.isDonation && '❤️'}</h6>
                  <h3 className="fw-bold mb-0">{a.balance} ETB</h3>
                  <small>Inc: {a.income} | Exp: {a.expense}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <h5 className="fw-bold mb-3">Record Transaction</h5>
        <form onSubmit={addTxn} className="bg-light p-3 rounded-3 border mb-4">
          <div className="row">
            <div className="col-6 mb-2"><select className="form-select" value={txn.account} onChange={e => setTxn({ ...txn, account: e.target.value })} required><option value="">Account</option>{accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}</select></div>
            <div className="col-6 mb-2"><select className="form-select" value={txn.type} onChange={e => setTxn({ ...txn, type: e.target.value })}><option value="income">Income</option><option value="expense">Expense</option></select></div>
          </div>
          <div className="mb-2"><input type="number" className="form-control" placeholder="Amount" value={txn.amount} onChange={e => setTxn({ ...txn, amount: e.target.value })} required /></div>
          <div className="mb-2"><input type="text" className="form-control" placeholder="Category" value={txn.category} onChange={e => setTxn({ ...txn, category: e.target.value })} /></div>
          <div className="mb-2"><input type="date" className="form-control" value={txn.transactionDate} onChange={e => setTxn({ ...txn, transactionDate: e.target.value })} /></div>
          <button type="submit" className="btn btn-success w-100 fw-bold">Save</button>
        </form>
        
        <h5 className="fw-bold mb-3">Recent Transactions</h5>
        <ul className="list-group shadow-sm">
          {transactions.slice(0, 5).map(t => (
            <li key={t._id} className="list-group-item d-flex justify-content-between">
              <div><strong className={t.type === 'income' ? 'text-success' : 'text-danger'}>{t.type === 'income' ? '+' : '-'} {t.amount}</strong><small className="d-block text-muted">{t.account?.name} - {t.category}</small></div>
              <small className="text-muted">{new Date(t.transactionDate).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- COMPLAINTS TAB ---
function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [replyText, setReplyText] = useState({});

  const load = () => api.get('/admin/complaints').then(r => setComplaints(r.data));
  useEffect(() => { load(); }, []);

  const submitReply = async (id) => {
    if (!replyText[id]) return;
    await api.put(`/admin/complaints/${id}`, { reply: replyText[id] });
    setReplyText({ ...replyText, [id]: '' });
    load();
  };

  return (
    <div>
      <h5 className="fw-bold mb-4">Student Complaints</h5>
      <div className="row">
        {complaints.map(c => (
          <div className="col-md-6 mb-3" key={c._id}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">{c.title}</h6>
                  <span className={`badge ${c.status === 'resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>{c.status}</span>
                </div>
                <p className="small text-muted mb-1">From: {c.student?.fullName}</p>
                <p className="bg-light p-2 rounded small border">{c.message}</p>
                {c.adminReply ? (
                  <div className="alert alert-success py-2 mb-0 small"><strong>Reply:</strong> {c.adminReply}</div>
                ) : (
                  <div className="input-group mt-3">
                    <input type="text" className="form-control form-control-sm" placeholder="Reply..." value={replyText[c._id] || ''} onChange={(e) => setReplyText({ ...replyText, [c._id]: e.target.value })} />
                    <button className="btn btn-sm btn-success" onClick={() => submitReply(c._id)}>Send</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- NEWS TAB ---
function AdminNews() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });

  const load = () => api.get('/news').then(r => setNews(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/news', form);
    setForm({ title: '', content: '' });
    load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/news/${id}`); load(); };

  return (
    <div className="row">
      <div className="col-md-5">
        <h5 className="fw-bold mb-3">Post News</h5>
        <form onSubmit={submit} className="bg-light p-3 rounded-3 border">
          <div className="mb-2"><input type="text" className="form-control" placeholder="News Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="mb-3"><textarea className="form-control" rows="4" placeholder="Write the announcement here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required></textarea></div>
          <button type="submit" className="btn btn-success w-100 fw-bold">Publish</button>
        </form>
      </div>
      <div className="col-md-7">
        <h5 className="fw-bold mb-3">Published News</h5>
        <ul className="list-group shadow-sm">
          {news.map(n => (
            <li key={n._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
              <div><h6 className="fw-bold mb-1">{n.title}</h6><p className="text-muted small mb-0">{n.content}</p></div>
              <button onClick={() => del(n._id)} className="btn btn-sm btn-outline-danger">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}