import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const REGIONS = ['Oromia', 'Amhara', 'Tigray', 'Sidama', 'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 'Harari', 'Addis Ababa', 'Dire Dawa', 'South Ethiopia', 'Central Ethiopia', 'South West Ethiopia'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Medicine', 'Nursing', 'Public Health', 'Accounting', 'Management', 'Economics', 'Law', 'Agriculture', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];
const CAMPUSES = ['Ardu Campus', 'Dinsho Campus', 'Bokoji Campus', 'Health Campus'];
const KITABS = ['Usuul', 'Buluug', 'Qur\'aan', 'Tafsir', 'Riyaada', 'Al-Qaida'];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', role: 'student',
    phone: '', region: '', zone: '', city: '', campus: 'Ardu Campus',
    department: 'Not Specified', year: '1st Year',
    islamicEducationStatus: 'none', quranLevel: 'beginner',
    kitabPreferences: 'Usuul', 
    specialization: ''
  });

  const [makePayment, setMakePayment] = useState(false);
  const [payment, setPayment] = useState({ amount: 100, method: 'Telebirr', reference: '' });
  const [receipt, setReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    try {
      setIsProcessing(true);
      
      const profile = form.role === 'student'
        ? {
            phone: form.phone, region: form.region, zone: form.zone, city: form.city,
            campus: form.campus,
            department: form.department,
            year: form.year,
            islamicEducationStatus: form.islamicEducationStatus,
            quranLevel: form.quranLevel,
            kitabPreferences: form.kitabPreferences
          }
        : { phone: form.phone, specialization: form.specialization.split(',').map(s => s.trim()) };

      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('fullName', form.fullName);
      fd.append('role', form.role);
      fd.append('profile', JSON.stringify(profile));

      if (makePayment) {
        fd.append('paymentAmount', payment.amount);
        fd.append('paymentMethod', payment.method);
        fd.append('paymentReference', payment.reference);
        if (receipt) fd.append('receipt', receipt);
      }

      const { data } = await api.post('/auth/register', fd);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (e) { 
      setErr(e.response?.data?.message || 'Registration failed'); 
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mt-5 mb-5" style={{ maxWidth: '650px' }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4 p-md-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold text-success mb-1">Join Muslim Jama'aa</h2>
            <p className="text-muted">Arsi University Registration</p>
          </div>
          
          <div className="progress mb-4" style={{ height: '8px' }}>
            <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          {err && <div className="alert alert-danger shadow-sm">{err}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary border-bottom pb-2">Step 1: Account Information</h5>
              <div className="mb-3">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control bg-light" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email Address</label>
                <input type="email" className="form-control bg-light" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Password</label>
                <input type="password" className="form-control bg-light" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">I am joining as:</label>
                <select className="form-select border-success" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="ustaz">Ustaz (Teacher)</option>
                </select>
              </div>
              <button onClick={next} className="btn btn-success w-100 fw-bold shadow-sm">Next Step</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary border-bottom pb-2">Step 2: Contact & Location</h5>
              <div className="mb-3">
                <label className="form-label fw-bold">Phone Number</label>
                <input type="text" className="form-control bg-light" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              
              {form.role === 'student' && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Region</label>
                    <select className="form-select bg-light" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                      <option value="">Select your region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Zone</label>
                      <input type="text" className="form-control bg-light" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">City</label>
                      <input type="text" className="form-control bg-light" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-success">Campus</label>
                    <select className="form-select border-success" value={form.campus} onChange={e => setForm({ ...form, campus: e.target.value })}>
                      {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-bold text-success">Department</label>
                      <select className="form-select border-success" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold text-success">Year</label>
                      <select className="form-select border-success" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="d-flex gap-2 mt-4">
                <button onClick={back} className="btn btn-light border w-50 fw-bold">Back</button>
                <button onClick={next} className="btn btn-success w-50 fw-bold shadow-sm">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 3 STUDENT */}
          {step === 3 && form.role === 'student' && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary border-bottom pb-2">Step 3: Islamic Education</h5>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Islamic Education Status</label>
                <select className="form-select bg-light" value={form.islamicEducationStatus} onChange={e => setForm({ ...form, islamicEducationStatus: e.target.value })}>
                  <option value="none">None</option>
                  <option value="madrasa">Madrasa</option>
                  <option value="hifz">Hifz</option>
                  <option value="alim">Alim</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Qur'an Level</label>
                <select className="form-select bg-light" value={form.quranLevel} onChange={e => setForm({ ...form, quranLevel: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="hafiz">Hafiz</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-bold text-success">Which Kitab do you want to learn?</label>
                <select className="form-select border-success" value={form.kitabPreferences} onChange={e => setForm({ ...form, kitabPreferences: e.target.value })}>
                  {KITABS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="d-flex gap-2">
                <button onClick={back} className="btn btn-light border w-50 fw-bold">Back</button>
                <button onClick={next} className="btn btn-success w-50 fw-bold shadow-sm">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 3 USTAZ */}
          {step === 3 && form.role === 'ustaz' && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary border-bottom pb-2">Step 3: Specialization</h5>
              <div className="mb-4">
                <label className="form-label fw-bold">What do you teach?</label>
                <input type="text" className="form-control bg-light" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Hifz, Fiqh" />
              </div>
              <div className="d-flex gap-2">
                <button onClick={back} className="btn btn-light border w-50 fw-bold">Back</button>
                <button onClick={next} className="btn btn-success w-50 fw-bold shadow-sm">Next Step</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary border-bottom pb-2">Step 4: Review & Confirm</h5>
              
              {/* COMPACT REVIEW CARD */}
              <div className="card shadow-sm border-0 rounded-4 mb-4 bg-light">
                <div className="card-body p-3">
                  <h6 className="fw-bold text-success mb-3 border-bottom pb-2">📋 Registration Summary</h6>
                  
                  <div className="row g-2 small">
                    <div className="col-5 text-muted">Full Name:</div>
                    <div className="col-7 fw-bold text-end">{form.fullName}</div>
                    
                    <div className="col-5 text-muted">Email:</div>
                    <div className="col-7 fw-bold text-end text-break">{form.email}</div>
                    
                    <div className="col-5 text-muted">Phone:</div>
                    <div className="col-7 fw-bold text-end">{form.phone || 'N/A'}</div>
                    
                    <div className="col-5 text-muted">Role:</div>
                    <div className="col-7 fw-bold text-end text-capitalize text-success">{form.role}</div>
                    
                    {form.role === 'student' && (
                      <>
                        <div className="col-12"><hr className="my-2" /></div>
                        <div className="col-5 text-muted">Campus:</div>
                        <div className="col-7 fw-bold text-end">{form.campus}</div>
                        
                        <div className="col-5 text-muted">Location:</div>
                        <div className="col-7 fw-bold text-end">{form.city}, {form.zone} ({form.region})</div>

                        <div className="col-5 text-muted">Department:</div>
                        <div className="col-7 fw-bold text-end">{form.department}</div>

                        <div className="col-5 text-muted">Year:</div>
                        <div className="col-7 fw-bold text-end">{form.year}</div>
                        
                        <div className="col-12"><hr className="my-2" /></div>
                        
                        <div className="col-5 text-muted">Qur'an Level:</div>
                        <div className="col-7 fw-bold text-end text-capitalize">{form.quranLevel}</div>
                        
                        <div className="col-5 text-muted">Islamic Ed:</div>
                        <div className="col-7 fw-bold text-end text-capitalize">{form.islamicEducationStatus}</div>
                        
                        <div className="col-5 text-muted">Selected Kitab:</div>
                        <div className="col-7 fw-bold text-end text-success">{form.kitabPreferences}</div>
                      </>
                    )}

                    {form.role === 'ustaz' && (
                      <>
                        <div className="col-12"><hr className="my-2" /></div>
                        <div className="col-5 text-muted">Specialization:</div>
                        <div className="col-7 fw-bold text-end">{form.specialization}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ARABIC QUOTE CARD (RESTORED) */}
              <div className="card border-0 shadow-sm mb-4 text-center" style={{ background: 'linear-gradient(145deg, #e8f5e9, #c8e6c9)' }}>
                <div className="card-body p-3">
                  <h5 className="fw-bold text-success mb-2" style={{ fontFamily: 'serif', lineHeight: '1.8' }}>مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُم فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَت سَبعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ</h5>
                  <p className="text-dark fst-italic mb-0" style={{ fontSize: '0.8rem' }}>"The example of those who spend their wealth in the way of Allah is like a seed [of grain] which grows seven spikes; in each spike is a hundred grains." (Al-Baqarah: 261)</p>
                </div>
              </div>

              {/* PAYMENT OPTION */}
              <div className="form-check form-switch mb-3 bg-light p-3 rounded-3 border shadow-sm">
                <input className="form-check-input" type="checkbox" id="paymentCheck" checked={makePayment} onChange={e => setMakePayment(e.target.checked)} style={{ width: '2.5em', height: '1.25em', marginTop: '0.2em' }} />
                <label className="form-check-label fw-bold text-success ms-2" htmlFor="paymentCheck" style={{ cursor: 'pointer' }}>
                  Include a Donation / Payment (Optional)
                </label>
              </div>

              {makePayment && (
                <div className="fade-in bg-white p-3 rounded-4 shadow-sm border border-success border-opacity-25 mb-4">
                  <h6 className="fw-bold text-dark mb-3">💳 Checkout</h6>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold mb-1">Amount (ETB)</label>
                      <input type="number" className="form-control" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} min="10" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold mb-1">Method</label>
                      <select className="form-select" value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })}>
                        <option value="Telebirr">📱 Telebirr</option>
                        <option value="CBE Birr">🏦 CBE Birr</option>
                        <option value="Bank Transfer">🏛️ Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="alert alert-success bg-opacity-10 border-success mb-3 py-2">
                    <ul className="mb-0 small ps-3">
                      <li><strong>Telebirr:</strong> 0912-345-678</li>
                      <li><strong>CBE:</strong> 1000-2345-6789-0</li>
                    </ul>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1">Screenshot (Optional)</label>
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={e => setReceipt(e.target.files[0])} />
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="d-flex gap-2 mt-4">
                <button onClick={back} className="btn btn-light border w-50 fw-bold" disabled={isProcessing}>Back</button>
                <button onClick={submit} className="btn btn-success w-50 fw-bold shadow-sm" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}