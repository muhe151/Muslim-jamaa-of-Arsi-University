import { useEffect, useState } from 'react';
import api from '../api';

export default function UstazDashboard() {
  const [data, setData] = useState({ students: [], mySchedules: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ustaz/my-students').then(r => {
      setData(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold text-success mb-4">🎓 Ustaz Dashboard</h2>
      
      {loading ? (
        <div className="text-center"><div className="spinner-border text-success"></div></div>
      ) : (
        <div className="row">
          
          {/* 1. My Students List */}
          <div className="col-12 mb-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold mb-0">👨‍🎓 My Assigned Students ({data.students.length})</h5>
              </div>
              <div className="card-body">
                
                {data.students.length === 0 ? (
                  <div className="alert alert-info py-2 small mb-0">
                    No students assigned to you yet. Students will appear here automatically when they register for the Kitabs you teach.
                  </div>
                ) : (
                  <div className="table-responsive bg-white rounded border">
                    <table className="table table-bordered table-striped align-middle mb-0">
                      <thead className="table-success">
                        <tr>
                          <th>Student Name</th>
                          <th>Kitab</th>
                          <th>Qur'an Level</th>
                          <th>Islamic Education</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.students.map(s => (
                          <tr key={s._id}>
                            <td className="fw-bold text-success">{s.fullName}</td>
                            <td><span className="badge bg-dark">{s.kitab}</span></td>
                            <td>{s.quranLevel}</td>
                            <td>{s.islamicEducationStatus}</td>
                            <td>{s.phone || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. My Schedule List */}
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h5 className="fw-bold mb-0">📅 My Teaching Schedule</h5>
              </div>
              <div className="card-body">
                
                {data.mySchedules.length === 0 ? (
                  <div className="alert alert-info py-2 small mb-0">No classes scheduled for you yet.</div>
                ) : (
                  <div className="table-responsive bg-white rounded border">
                    <table className="table table-bordered table-striped align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Date & Time</th>
                          <th>Class Title</th>
                          <th>Topic</th>
                          <th>Semester</th>
                          <th>Kitab</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.mySchedules.map(s => (
                          <tr key={s._id}>
                            <td className="fw-bold">
                              {new Date(s.sessionDate).toLocaleDateString()} <br/>
                              <small className="text-muted">{s.sessionTime}</small>
                            </td>
                            <td className="fw-bold text-success">{s.title}</td>
                            <td>{s.topic}</td>
                            <td><span className="badge bg-warning text-dark">{s.semester}</span></td>
                            <td><span className="badge bg-secondary">{s.targetKitab}</span></td>
                            <td>📍 {s.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}