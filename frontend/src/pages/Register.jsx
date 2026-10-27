import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const REGIONS = ['Oromia', 'Amhara', 'Tigray', 'Sidama', 'Somali', 'Afar', 'Benishangul-Gumuz', 'Gambela', 'Harari', 'Addis Ababa', 'Dire Dawa', 'South Ethiopia', 'Central Ethiopia', 'South West Ethiopia'];
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
      if (makePayment && !receipt) {
        return setErr('Please upload the payment screenshot.');
      }
      
      setIsProcessing(true);
      
      const profile = form.role === 'student'
        ? {
            phone: form.phone, region: form.region, zone: form.zone, city: form.city,
            campus: form.campus,
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
          <h2 className="text-center mb-1 fw-bold text-success">Create an Account</h2>
          <p className="text-center text-muted mb-4">Join the Muslim Jama'aa of Arsi University</p>
          
          <div className="progress mb-4" style={{ height: '8px' }}>
            <div className="progress-bar bg-success" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          {err && <div className="alert alert-danger">{err}</div>}

          {step === 1 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary">Step 1: Account Information</h5>
              <div className="mb-3"><label className="form-label fw-bold">Full Name</label><input type="text" className="form-control" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label fw-bold">Email Address</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label fw-bold">Password</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="mb-4"><label className="form-label fw-bold">I am joining as:</label><select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="ustaz">Ustaz (Teacher)</option></select></div>
              <button onClick={next} className="btn btn-success w-100 fw-bold">Next Step</button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary">Step 2: Contact & Location</h5>
              <div className="mb-3"><label className="form-label fw-bold">Phone Number</label><input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              {form.role === 'student' && (
                <>
                  <div className="mb-3"><label className="form-label fw-bold">Region</label><select className="form-select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}><option value="">Select your region</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">Zone</label><input type="text" className="form-control" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} /></div>
                    <div className="col-md-6 mb-3"><label className="form-label fw-bold">City</label><input type="text" className="form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  </div>

                  {/* CAMPUS DROPDOWN ADDED HERE */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-success">Campus</label>
                    <select className="form-select border-success" value={form.campus} onChange={e => setForm({ ...form, campus: e.target.value })}>
                      {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="d-flex gap-2 mt-4"><button onClick={back} className="btn btn-light border w-50">Back</button><button onClick={next} className="btn btn-success w-50 fw-bold">Next Step</button></div>
            </div>
          )}

          {step === 3 && form.role === 'student' && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary">Step 3: Islamic Education</h5>
              <div className="mb-3"><label className="form-label fw-bold">Islamic Education Status</label><select className="form-select" value={form.islamicEducationStatus} onChange={e => setForm({ ...form, islamicEducationStatus: e.target.value })}><option value="none">None</option><option value="madrasa">Madrasa</option><option value="hifz">Hifz</option><option value="alim">Alim</option></select></div>
              <div className="mb-3"><label className="form-label fw-bold">Qur'an Level</label><select className="form-select" value={form.quranLevel} onChange={e => setForm({ ...form, quranLevel: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="hafiz">Hafiz</option></select></div>
              
              {/* KITAB DROPDOWN ADDED HERE */}
              <div className="mb-4">
                <label className="form-label fw-bold text-success">Which Kitab do you want to learn?</label>
                <select className="form-select border-success" value={form.kitabPreferences} onChange={e => setForm({ ...form, kitabPreferences: e.target.value })}>
                  {KITABS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="d-flex gap-2"><button onClick={back} className="btn btn-light border w-50">Back</button><button onClick={next} className="btn btn-success w-50 fw-bold">Next Step</button></div>
            </div>
          )}

          {step === 3 && form.role === 'ustaz' && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary">Step 3: Specialization</h5>
              <div className="mb-4"><label className="form-label fw-bold">What do you teach?</label><input type="text" className="form-control" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Hifz, Fiqh" /></div>
              <div className="d-flex gap-2"><button onClick={back} className="btn btn-light border w-50">Back</button><button onClick={next} className="btn btn-success w-50 fw-bold">Next Step</button></div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in">
              <h5 className="mb-3 text-secondary">Step 4: Review & Submit</h5>
              <div className="bg-light p-3 rounded border mb-4">
                <p className="mb-1"><strong>Name:</strong> {form.fullName}</p>
                <p className="mb-1"><strong>Email:</strong> {form.email}</p>
                <p className="mb-1"><strong>Campus:</strong> {form.campus}</p>
                <p className="mb-0"><strong>Kitab:</strong> {form.kitabPreferences}</p>
              </div>

              <div className="card border-0 shadow-sm mb-4 text-center" style={{ background: 'linear-gradient(145deg, #e8f5e9, #c8e6c9)' }}>
                <div className="card-body p-4">
                  <h4 className="fw-bold text-success mb-3" style={{ fontFamily: 'serif', lineHeight: '1.8' }}>مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُم فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَت سَبعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ</h4>
                  <p className="text-dark fst-italic mb-0">"The example of those who spend their wealth in the way of Allah is like a seed [of grain] which grows seven spikes; in each spike is a hundred grains." (Al-Baqarah: 261)</p>
                </div>
              </div>

              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="paymentCheck" checked={makePayment} onChange={e => setMakePayment(e.target.checked)} style={{ width: '2.5em', height: '1.25em' }} />
                <label className="form-check-label fw-bold text-success ms-2" htmlFor="paymentCheck" style={{ cursor: 'pointer' }}>I would like to contribute a Sadaqah/Donation(optional)</label>
              </div>

              {makePayment && (
                <div className="fade-in bg-white p-4 rounded-3 shadow-sm border border-success border-opacity-25 mb-4">
                  <h6 className="fw-bold text-dark mb-3">Payment Details</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6"><label className="form-label small fw-bold">Amount (ETB)</label><input type="number" className="form-control" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} min="10" /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Payment Method</label><select className="form-select" value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })}><option value="Telebirr">📱 Telebirr</option><option value="CBE Birr">🏦 CBE Birr</option><option value="Bank Transfer">🏛️ Bank Transfer</option></select></div>
                  </div>

                  <div className="alert alert-success bg-opacity-10 border-success mb-4">
                    <h6 className="fw-bold mb-2">Please transfer to one of these accounts:</h6>
                    <ul className="mb-0 small"><li><strong>Telebirr:</strong> 0912-345-678 (Muslim Jama'aa)</li><li><strong>CBE:</strong> 1000-2345-6789-0 (Arsi University Jama'aa)</li></ul>
                  </div>

                  <div className="row g-3">
                    <div className="col-12"><label className="form-label small fw-bold">Transaction Reference (Optional)</label><input type="text" className="form-control" placeholder="e.g. TB123456789" value={payment.reference} onChange={e => setPayment({ ...payment, reference: e.target.value })} /></div>
                    <div className="col-12"><label className="form-label small fw-bold">Upload Payment Screenshot <span className="text-danger">*</span></label><input type="file" className="form-control" accept="image/*" onChange={e => setReceipt(e.target.files[0])} required /><small className="text-muted" style={{ fontSize: '0.75rem' }}>Upload the screenshot of your transaction.</small></div>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <button onClick={back} className="btn btn-light border w-50" disabled={isProcessing}>Back</button>
                <button onClick={submit} className="btn btn-success w-50 fw-bold" disabled={isProcessing}>{isProcessing ? 'Verifying...' : 'Submit & Create Account'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}