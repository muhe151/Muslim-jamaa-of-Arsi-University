import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
   const [studentData, setStudentData] = useState({ 
    ustazInfo: null, schedules: [], complaints: [], classmates: [], semesters: [], kitabName: '' 
  });
  const [donations, setDonations] = useState([]); // <--- ADD THIS LINE
  const [loading, setLoading] = useState(true);
  
  const [complaintForm, setComplaintForm] = useState({ title: '', message: '' });
  const [submitMsg, setSubmitMsg] = useState('');

  const loadData = () => {
    if (user?.role === 'student') {
      api.get('/students/dashboard').then(res => {
        setStudentData(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
    if (user?.role === 'student') {
      api.get('/finance/donations').then(res => setDonations(res.data)).catch(() => {});
    }
  }, [user]);

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/complaints', complaintForm);
      setComplaintForm({ title: '', message: '' });
      setSubmitMsg('Complaint submitted successfully!');
      setTimeout(() => setSubmitMsg(''), 3000);
      loadData(); 
    } catch (err) { alert('Failed to submit'); }
  };

  if (!user) return null;

      // ==========================================
  // ADMIN DASHBOARD (SLIDER & NON-CLICKABLE BOXES)
  // ==========================================
  if (user.role === 'admin') {
    return (
      <div className="container mt-4 mb-5" style={{ maxWidth: '1000px' }}>
        
        {/* Small Sliding Hero for Admin */}
        <div id="adminWelcomeSlider" className="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden mb-4" data-bs-ride="carousel" data-bs-interval="3000">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#adminWelcomeSlider" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#adminWelcomeSlider" data-bs-slide-to="1"></button>
          </div>
          <div className="carousel-inner" style={{ height: '140px' }}>
            
            <div className="carousel-item active h-100" style={{ background: 'linear-gradient(135deg, #198754, #146c43)' }}>
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center">
                <h3 className="fw-bold mb-1" style={{ fontFamily: 'serif' }}>السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</h3>
                <p className="mb-0 opacity-75">Assalamu Alaikum Warahmatullahi Wabarakatuh</p>
              </div>
            </div>

            <div className="carousel-item h-100" style={{ background: 'linear-gradient(135deg, #0b3d2e, #198754)' }}>
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center">
                <h4 className="fw-bold mb-1">Welcome, {user.fullName}</h4>
                <p className="mb-0 opacity-75">Muslim Jama'aa Admin Command Center</p>
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard Overview Cards (Non-Clickable) */}
        <div className="row g-3">
          
          {/* Schedule Box */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(to right, #e8f5e9, #ffffff)' }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div className="display-4 me-4">📅</div>
                <div>
                  <h4 className="fw-bold text-success mb-1">Schedules & Semesters</h4>
                  <p className="text-muted mb-0 small">Manage class timelines, assign Ustaz, and organize Kitabs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Students Box */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
              <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                <div className="display-5 mb-2">👨‍🎓</div>
                <h6 className="fw-bold mb-0">Students Database</h6>
                <small className="opacity-75">Registration & Data</small>
              </div>
            </div>
          </div>

          {/* Finance Box */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white">
              <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                <div className="display-5 mb-2">💰</div>
                <h6 className="fw-bold mb-0">Finance</h6>
                <small className="opacity-75">Donations & Fees</small>
              </div>
            </div>
          </div>

          {/* Complaints Box */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-danger text-white">
              <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                <div className="display-5 mb-2">📝</div>
                <h6 className="fw-bold mb-0">Complaints</h6>
                <small className="opacity-75">Student Support</small>
              </div>
            </div>
          </div>

          {/* Library Box */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
              <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
                <div className="display-5 mb-2">📚</div>
                <h6 className="fw-bold mb-0">Library</h6>
                <small className="opacity-75">PDF Management</small>
              </div>
            </div>
          </div>

          {/* Button to open the real Admin Panel */}
          <div className="col-12 mt-4 text-center">
            <Link to="/admin" className="btn btn-success btn-lg px-5 fw-bold rounded-pill shadow-sm">
              ⚙️ Go to Admin Control Panel
            </Link>
          </div>

        </div>
      </div>
    );
  }
  // ==========================================
  // STUDENT DASHBOARD (WITH USTAZ & TABLES)
  // ==========================================
  return (
    <div className="container mt-4 mb-5">
      
      {/* Small Sliding Hero */}
      {user.role === 'student' && (
        <div id="welcomeSlider" className="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden mb-4" data-bs-ride="carousel" data-bs-interval="3000">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#welcomeSlider" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#welcomeSlider" data-bs-slide-to="1"></button>
          </div>
          <div className="carousel-inner" style={{ height: '140px' }}>
            <div className="carousel-item active h-100" style={{ background: 'linear-gradient(135deg, #198754, #146c43)' }}>
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center">
                <h3 className="fw-bold mb-1" style={{ fontFamily: 'serif' }}>السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ</h3>
                <p className="mb-0 opacity-75">Assalamu Alaikum Warahmatullahi Wabarakatuh</p>
              </div>
            </div>
            <div className="carousel-item h-100" style={{ background: 'linear-gradient(135deg, #0b3d2e, #198754)' }}>
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white text-center">
                <h4 className="fw-bold mb-1">Welcome to Arsi University</h4>
                <p className="mb-0 opacity-75">Muslim Jama'aa Student Portal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        
        {/* LEFT SIDE: Quick Links & Ustaz Info (Only for Students) */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 mb-4" style={{ background: '#f8f9fa' }}>
            <div className="card-body p-4 text-center">
              <div className="display-4 mb-2">🧑‍🏫</div>
              <h5 className="fw-bold text-dark mb-1">Your Ustaz</h5>
              {studentData.ustazInfo ? (
                <>
                  <h6 className="text-success fw-bold mb-2">{studentData.ustazInfo.name}</h6>
                  <a href={`tel:${studentData.ustazInfo.phone}`} className="btn btn-outline-success rounded-pill px-4 btn-sm fw-bold">
                    📞 {studentData.ustazInfo.phone}
                  </a>
                </>
              ) : (
                <p className="text-muted small">Not assigned yet</p>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-3">Quick Actions</h5>
              <div className="d-grid gap-2">
                <Link to="/profile" className="btn btn-light border text-start py-2 fw-bold text-dark">
                  👤 Update My Profile
                </Link>
                <Link to="/books" className="btn btn-light border text-start py-2 fw-bold text-dark">
                  📚 Browse Islamic Library
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Schedule Table & Complaints */}
        <div className="col-lg-8">
          
          {user.role === 'ustaz' && (
             <div className="card shadow-sm border-0 rounded-4 h-100">
               <div className="card-body p-5">
                 <h3 className="fw-bold text-success mb-4">Ustaz Dashboard</h3>
                 <p className="text-muted">Guide your students in their Qur'an and Kitab studies.</p>
                 <div className="mt-4 p-4 bg-light rounded-4 border">
                   <h5 className="fw-bold">Your Role:</h5>
                   <p>You are assigned to teach students. Click below to view your students and their schedule.</p>
                   <Link to="/ustaz" className="btn btn-success mt-2">Go to My Students</Link>
                 </div>
               </div>
             </div>
          )}

          {user.role === 'student' && (
            <>
              <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold text-success mb-0">📅 My Class Schedule</h4>
                    <button 
                      onClick={async () => {
                        const res = await api.get('/students/my-schedule/pdf', { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const a = document.createElement('a');
                        a.href = url; a.download = 'my_full_report.pdf';
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }} 
                      className="btn btn-success fw-bold shadow-sm rounded-pill px-4"
                    >
                      ⬇️ Download PDF
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                  ) : (
                    <div className="table-responsive rounded-3 border">
                      <table className="table table-hover table-borderless align-middle mb-0">
                        <thead className="bg-light text-success">
                          <tr>
                            <th className="fw-bold py-3 border-bottom border-success border-2">Semester & Deadline</th>
                            <th className="fw-bold py-3 border-bottom border-success border-2">Kitab</th>
                            <th className="fw-bold py-3 border-bottom border-success border-2">Ustaz</th>
                            <th className="fw-bold py-3 border-bottom border-success border-2">Location & Masjid</th>
                            <th className="fw-bold py-3 border-bottom border-success border-2">Time</th>
                            <th className="fw-bold py-3 text-center border-bottom border-success border-2">Classmates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentData.schedules.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center text-muted py-5">
                                🎉 No classes scheduled yet. Enjoy your free time!
                              </td>
                            </tr>
                          ) : (
                            studentData.schedules?.map((s, index) => {
                              return (
                                <tr key={index} className="border-bottom">
                                  <td className="align-top pt-3">
                                    <span className={`badge ${s.semester === 'Semester 1' ? 'bg-success' : 'bg-dark'} mb-1 d-block`}>
                                      {s.semester}
                                    </span>
                                    <div className="text-muted small">
                                      End: {new Date(s.sessionDate).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td className="align-top pt-3 fw-bold text-dark">{s.targetKitab}</td>
                                  <td className="align-top pt-3 text-success fw-bold">{s.ustaz?.fullName || 'Pending'}</td>
                                  <td className="align-top pt-3">
                                    <div className="fw-bold text-dark">📍 {s.location}</div>
                                    <div className="text-muted small">🕌 {s.masjidName}</div>
                                  </td>
                                  <td className="align-top pt-3">
                                    <div className="fw-bold text-dark">🕒 {s.sessionTime}</div>
                                  </td>
                                  
                                  {index === 0 ? (
                                    <td rowSpan={studentData.schedules.length} className="align-top pt-3 text-center bg-light bg-opacity-50">
                                      <div className="d-flex flex-column align-items-center gap-1">
                                        {studentData.classmates.length === 0 ? (
                                          <span className="text-muted small">None yet</span>
                                        ) : (
                                          studentData.classmates?.map((c, i) => (
                                            <span key={i} className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill mb-1 w-100" style={{ fontSize: '0.75rem' }}>
                                              {c.name}
                                            </span>
                                          ))
                                        )}
                                      </div>
                                    </td>
                                  ) : null}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold text-dark mb-3">📝 Complaints & Support</h4>
                  
                  <form onSubmit={submitComplaint} className="bg-light p-3 rounded-4 mb-4">
                    {submitMsg && <div className="alert alert-success py-2 small text-center rounded-3">{submitMsg}</div>}
                    <div className="row g-2">
                      <div className="col-md-4">
                        <input type="text" className="form-control border-0 shadow-sm" placeholder="Title (e.g. Missing Book)" 
                          value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <input type="text" className="form-control border-0 shadow-sm" placeholder="Describe your issue..." 
                          value={complaintForm.message} onChange={e => setComplaintForm({...complaintForm, message: e.target.value})} required />
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">Send</button>
                      </div>
                    </div>
                  </form>

                  {studentData.complaints.length === 0 ? (
                    <p className="text-muted small text-center my-3">No complaints submitted yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {studentData.complaints?.map(c => (
                        <div key={c._id} className="card border-0 shadow-sm rounded-3">
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="fw-bold mb-0 text-dark">{c.title}</h6>
                              <span className={`badge rounded-pill ${c.status === 'resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-muted small mb-2">{c.message}</p>
                            {c.adminReply && (
                              <div className="bg-success bg-opacity-10 p-2 rounded border-start border-4 border-success">
                                <strong className="text-success small d-block">Admin Reply:</strong>
                                <span className="small text-dark">{c.adminReply}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
                            {/* PUBLIC DONATIONS SECTION */}
              {donations.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 mt-4">
                  <div className="card-body p-4">
                    <h4 className="fw-bold text-success mb-3">❤️ Active Donation Drives</h4>
                    <div className="row g-3">
                      {donations.map(d => (
                        <div className="col-md-4" key={d._id}>
                          <div className="card border-success border-opacity-50 shadow-sm h-100 bg-success bg-opacity-10 text-center">
                            <div className="card-body">
                              <h6 className="fw-bold text-dark">{d.name}</h6>
                              <p className="text-muted small mb-2">{d.description || 'Support the Jama\'aa'}</p>
                              <h4 className="fw-bold text-success mb-0">{d.totalDonated} ETB</h4>
                              <small className="text-muted">Collected</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
              