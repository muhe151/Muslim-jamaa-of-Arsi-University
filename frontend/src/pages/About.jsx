import React from 'react';

export default function About() {
  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-5">
          <h1 className="fw-bold text-success text-center mb-4">About Muslim Jama'aa</h1>
          <h4 className="text-center text-muted mb-5">Arsi University</h4>
          
          <div className="row">
            <div className="col-md-8 mx-auto">
              <h5 className="fw-bold text-dark">Our History</h5>
              <p className="text-muted lh-lg">
                The Muslim Jama'aa at Arsi University was founded with a vision to unite Muslim students, provide them with a supportive environment, and deepen their connection with Islamic knowledge. Since its establishment, the Jama'aa has grown from a small group of dedicated students to a thriving community. We have continuously organized Qur'anic studies, Kitab reading circles (Halaqas), and spiritual gatherings.
              </p>
              
              <h5 className="fw-bold text-dark mt-4">Our Mission Today</h5>
              <p className="text-muted lh-lg">
                Today, our mission is to nurture the next generation of Muslim scholars and professionals. Through our digital platform, we connect students with qualified Ustaz teachers, provide a vast digital library of Islamic PDFs, and organize annual schedules. We strive to ensure that every student at Arsi University has the resources they need to balance their academic studies with their Islamic identity.
              </p>

              <div className="bg-light p-4 rounded-3 mt-4 border-start border-4 border-success">
                <p className="mb-0 fst-italic text-success">"Seeking knowledge is an obligation upon every Muslim." (Ibn Majah)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}