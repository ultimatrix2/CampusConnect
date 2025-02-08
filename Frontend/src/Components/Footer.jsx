import React from 'react';
import './Footer.css';
import { FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-logo">Campus Connect</span>
        </div>
        <div className="footer-center">
          <p className="footer-quote">Connecting minds, creating the future.</p>
          <p className="footer-quote">Stay informed, engage, and grow together with your campus community.</p>
        </div>

        <div className="footer-right">
          <ul className="social-links">
            <li><a href="https://www.linkedin.com/" className="social-icon" target="_blank" rel="noopener noreferrer"><FaLinkedin size={25} /></a></li>
            <li><a href="mailto:anshika.2024ca018@mnnit.ac.in" className="social-icon" target="_blank" rel="noopener noreferrer"><FaEnvelope size={25} /></a></li>
            <li><a href="https://github.com/syntax-squad-DevJam-2k25/CampusConnect" className="social-icon" target="_blank" rel="noopener noreferrer"><FaGithub size={25} /></a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p><b>&copy; {new Date().getFullYear()} Campus Connect. All rights reserved.</b></p>
      </div>
    </footer>
  );
};

export default Footer;
