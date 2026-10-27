import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto border-top border-success border-3">
      <div className="container">
        <div className="row">
          
          {/* Brand & About */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold text-success mb-3">🕌 Muslim Jama'aa</h5>
            <p className="text-light opacity-75 small lh-lg">
              The official Muslim Students' association at Arsi University. Dedicated to spiritual growth, Islamic education, and community building.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3 text-white">Quick Links</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/" className="text-light opacity-75 text-decoration-none footer-link">Home</Link></li>
              <li className="mb-2"><Link to="/about" className="text-light opacity-75 text-decoration-none footer-link">About Us</Link></li>
              <li className="mb-2"><Link to="/books" className="text-light opacity-75 text-decoration-none footer-link">Library</Link></li>
            </ul>
          </div>

          {/* Privacy & Contact */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-white">Information</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#privacy" className="text-light opacity-75 text-decoration-none footer-link">Privacy Policy</a></li>
              <li className="mb-2"><a href="#terms" className="text-light opacity-75 text-decoration-none footer-link">Terms of Service</a></li>
              <li className="mb-2 text-light opacity-75">📍 Arsi University, Asella</li>
              <li className="mb-2 text-light opacity-75">✉️ jamaa@arsi.edu.et</li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-white">Follow Us</h6>
            <div className="d-flex gap-2">
              <a href="https://www.facebook.com/mohammed.n.jemal.3" className="btn btn-outline-success rounded-circle social-btn"><i className="bi bi-facebook"></i></a>
              <a href="https://t.me/muhe_family" className="btn btn-outline-success rounded-circle social-btn"><i className="bi bi-telegram"></i></a>
              <a href="https://twitter.com/@muhe2312" className="btn btn-outline-success rounded-circle social-btn"><i className="bi bi-twitter"></i></a>
              <a href="https://www.youtube.com/@technologyfaanafuulduratti" className="btn btn-outline-success rounded-circle social-btn"><i className="bi bi-youtube"></i></a>
              <a href="https://www.tiktok.com/@muhemedia?_r=1&_t=ZS-9AMKE0UHvHx" className="btn btn-outline-success rounded-circle social-btn"><i className="bi bi-tiktok"></i></a>
            </div>
          </div>

        </div>
        
        <hr className="border-secondary mt-4" />  
        <div className="text-center text-light opacity-50 small">
          &copy; {new Date().getFullYear()} Muslim Jama'aa - Arsi University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}