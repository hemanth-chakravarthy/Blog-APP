import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect authenticated users to blogs page if they try to access the landing page
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      
      <header className="home-header">
        <h1>Welcome to BlogApp</h1>
        <p className="tagline">Create, manage, and share your thoughts with the world</p>
        <button onClick={handleGetStarted} className="cta-button register">
          Get Started
        </button>
      </header>
      
      <div className="home-content">
        <section className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Easy to Use</h3>
              <p>Simple and intuitive interface for creating and managing your blogs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Auto-Save</h3>
              <p>Never lose your work with our automatic saving feature</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your blogs from any device, anywhere</p>
            </div>
          </div>
        </section>
        
        <section className="cta-section">
          <h2>Ready to start writing?</h2>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="cta-button login">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="cta-button login">Login</Link>
                <Link to="/register" className="cta-button register">Register</Link>
              </>
            )}
          </div>
        </section>
      </div>
      
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} BlogApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;


