import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

// Simple 3D Particle Background Component (CSS-based)
const ParticleBackground = () => {
  return (
    <div className="particle-container">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// API Helper
const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== COMPONENTS ====================

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        <span className="brand-icon">💚</span>
        <span className="brand-text">Muqaddas Network</span>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <button onClick={() => navigate("/dashboard")} className="nav-btn" data-testid="dashboard-btn">
              Dashboard
            </button>
            <button onClick={() => navigate("/donate")} className="nav-btn donate-btn" data-testid="donate-btn">
              Donate Now
            </button>
            <span className="user-name">👤 {user.name}</span>
            <button onClick={logout} className="nav-btn logout-btn" data-testid="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className="nav-btn" data-testid="login-nav-btn">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="nav-btn register-btn" data-testid="register-nav-btn">
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

// Landing Page
const LandingPage = () => {
  const [stats, setStats] = useState(null);
  const [platformFees, setPlatformFees] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, feesRes] = await Promise.all([
          api.get("/stats/public"),
          api.get("/platform-fees")
        ]);
        setStats(statsRes.data);
        setPlatformFees(feesRes.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-page" data-testid="landing-page">
      {/* 3D Particle Background */}
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="hero-section hero-3d">
        <div className="hero-content">
          <div className="hero-badge animate-float">🏆 Guinness World Record Goal</div>
          <h1 className="hero-title hero-title-3d">
            <span className="title-green glow-text">Muqaddas</span> Network
          </h1>
          <p className="hero-subtitle">
            High-Tech 3D Platform for Helping Cancer Patients & Poor People 💚
          </p>
          <div className="hero-features">
            <div className="feature-tag feature-3d">🛡️ Zero-Tax Sovereign Shield</div>
            <div className="feature-tag feature-3d">🔒 60% Family Equity Lock</div>
            <div className="feature-tag feature-3d">💝 ₹15 Rule (₹10+₹5)</div>
            <div className="feature-tag feature-3d">🎁 2% VIP Gift Income</div>
          </div>
          <div className="hero-buttons">
            <button onClick={() => navigate("/register")} className="btn-primary btn-3d-effect" data-testid="get-started-btn">
              Get Started 🚀
            </button>
            <button onClick={() => navigate("/donate")} className="btn-secondary btn-3d-effect" data-testid="donate-now-btn">
              Donate Now 💚
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="stats-card stats-card-3d">
            <div className="floating-icon">💚</div>
            <h3>Live Impact</h3>
            <div className="stat-item">
              <span className="stat-value stat-glow">₹{stats?.total_donations?.toLocaleString() || "0"}</span>
              <span className="stat-label">Total Donations</span>
            </div>
            <div className="stat-item">
              <span className="stat-value stat-glow">₹{stats?.charity_fund?.toLocaleString() || "0"}</span>
              <span className="stat-label">Charity Fund (₹5/donation)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value stat-glow">{stats?.total_donors || "0"}</span>
              <span className="stat-label">Total Donors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Family Equity Section */}
      <section className="equity-section">
        <h2 className="section-title">🔒 60% Family Equity - Permanently Locked</h2>
        <div className="equity-card">
          <div className="equity-header">
            <div className="lock-icon">🔐</div>
            <div className="equity-status">PERMANENT LOCK</div>
          </div>
          <div className="equity-details">
            <div className="beneficiary">
              <span className="beneficiary-icon">👸</span>
              <div>
                <strong>AP Aliza Khatun</strong>
                <span>Family Head</span>
              </div>
            </div>
            <div className="beneficiary">
              <span className="beneficiary-icon">👧</span>
              <div>
                <strong>Daughters</strong>
                <span>Children</span>
              </div>
            </div>
          </div>
          <div className="equity-bar">
            <div className="equity-fill" style={{ width: "60%" }}></div>
            <span className="equity-percent">60%</span>
          </div>
          <p className="equity-note">This equity cannot be changed or transferred. Forever protected.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How Muqaddas Network Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Register</h3>
            <p>Create your free account to join the network</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">📱</div>
            <h3>Scan QR</h3>
            <p>Scan our SBI-7917 QR code to donate</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">💚</div>
            <h3>Help Others</h3>
            <p>₹5 from every donation goes to charity</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon">🎁</div>
            <h3>Earn VIP</h3>
            <p>Get 2% VIP gift income on donations</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2 className="section-title">Our Mission</h2>
        <div className="mission-cards">
          <div className="mission-card cancer">
            <div className="mission-icon">🎗️</div>
            <h3>Cancer Patients</h3>
            <p>Providing financial support and hope to cancer patients fighting for their lives</p>
          </div>
          <div className="mission-card poor">
            <div className="mission-icon">🤲</div>
            <h3>Poor People</h3>
            <p>Helping those in need with food, shelter, and basic necessities</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">💚</span>
            <span>Muqaddas Network</span>
          </div>
          <p>Building a better world, one donation at a time.</p>
          <p className="footer-tagline">🏆 Aiming for Guinness World Record</p>
        </div>
      </footer>
    </div>
  );
};

// Login Page
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.access_token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">💚</span>
          <h2>Welcome Back</h2>
          <p>Login to Muqaddas Network</p>
        </div>
        {error && <div className="error-message" data-testid="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              data-testid="email-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              data-testid="password-input"
            />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading} data-testid="login-submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, phone, password });
      login(response.data.access_token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" data-testid="register-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">💚</span>
          <h2>Join Muqaddas Network</h2>
          <p>Create your account to start helping</p>
        </div>
        {error && <div className="error-message" data-testid="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              data-testid="name-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              data-testid="email-input"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              required
              data-testid="phone-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              data-testid="password-input"
            />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading} data-testid="register-submit-btn">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [familyEquity, setFamilyEquity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes, equityRes] = await Promise.all([
          api.get("/stats"),
          api.get("/donations"),
          api.get("/family-equity")
        ]);
        setStats(statsRes.data);
        setDonations(donationsRes.data);
        setFamilyEquity(equityRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name} 💚</h1>
        <button onClick={() => navigate("/donate")} className="btn-primary" data-testid="dashboard-donate-btn">
          Make Donation
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats?.total_donations?.toLocaleString() || "0"}</span>
            <span className="stat-label">Total Donations</span>
          </div>
        </div>
        <div className="stat-card charity">
          <div className="stat-icon">💚</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats?.charity_fund?.toLocaleString() || "0"}</span>
            <span className="stat-label">Charity Fund (₹5/donation)</span>
          </div>
        </div>
        <div className="stat-card vip">
          <div className="stat-icon">🎁</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats?.vip_income?.toLocaleString() || "0"}</span>
            <span className="stat-label">VIP Income (2%)</span>
          </div>
        </div>
        <div className="stat-card family">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats?.family_equity?.toLocaleString() || "0"}</span>
            <span className="stat-label">Family Equity (60%)</span>
          </div>
        </div>
      </div>

      {/* Family Equity Card */}
      {familyEquity && (
        <div className="family-equity-section">
          <h2>🔒 Family Equity Status</h2>
          <div className="family-card">
            <div className="family-status">
              <span className="status-badge">{familyEquity.status}</span>
              <span className="equity-percent">{familyEquity.equity_percent}%</span>
            </div>
            <div className="beneficiaries">
              {familyEquity.beneficiaries?.map((b, i) => (
                <div key={i} className="beneficiary-item">
                  <span className="beneficiary-name">{b.name}</span>
                  <span className="beneficiary-relation">{b.relation}</span>
                </div>
              ))}
            </div>
            <p className="family-note">{familyEquity.description}</p>
          </div>
        </div>
      )}

      {/* Donations History */}
      <div className="donations-section">
        <h2>📋 Your Donations</h2>
        {donations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No donations yet. Make your first donation!</p>
            <button onClick={() => navigate("/donate")} className="btn-secondary">
              Donate Now
            </button>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-item" data-testid="donation-item">
                <div className="donation-info">
                  <span className="donation-amount">₹{donation.amount?.toLocaleString()}</span>
                  <span className="donation-date">{new Date(donation.created_at).toLocaleDateString()}</span>
                </div>
                <div className="donation-status">
                  <span className={`status ${donation.status}`}>{donation.status}</span>
                  <span className="charity-tag">+₹5 to charity</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Donate Page with QR Code
const DonatePage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState(user?.name || "");
  const [donorPhone, setDonorPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await api.post("/donations", {
        amount: parseFloat(amount),
        donor_name: donorName,
        donor_phone: donorPhone,
        message: message
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting donation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="donate-page success" data-testid="donation-success">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Donation Recorded!</h2>
          <p>Thank you for your generous donation of ₹{amount}</p>
          <div className="impact-info">
            <p>💚 ₹5 will go directly to charity fund</p>
            <p>🎁 2% VIP gift income activated</p>
            <p>🔒 60% secured in family equity</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page" data-testid="donate-page">
      <div className="donate-container">
        {/* QR Code Section */}
        <div className="qr-section">
          <h2>🛡️ Zero-Tax Sovereign Shield</h2>
          <p className="qr-subtitle">Scan with any UPI app to donate</p>
          <div className="qr-card">
            <div className="bank-info">
              <span className="bank-icon">🏦</span>
              <span>State Bank of India - 7917</span>
            </div>
            <div className="qr-code-container">
              <img 
                src="https://customer-assets.emergentagent.com/job_task-updater-2/artifacts/pf4hh0z6_Screenshot_20260112_142257.jpg" 
                alt="SBI-7917 QR Code" 
                className="qr-image"
                data-testid="qr-code-image"
              />
            </div>
            <div className="account-holder">
              <span className="holder-name">ARIF ULLAH</span>
              <span className="holder-phone">+91 7638082406</span>
            </div>
            <div className="shield-badge">
              <span>🛡️</span>
              <span>ZERO-TAX SOVEREIGN SHIELD ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="donation-form-section">
          <h2>Record Your Donation</h2>
          <p>After scanning QR, fill this form to track your contribution</p>
          
          {!user && (
            <div className="login-prompt">
              <p>Please login to record your donation</p>
              <button onClick={() => navigate("/login")} className="btn-primary">
                Login
              </button>
            </div>
          )}

          {user && (
            <form onSubmit={handleSubmit} className="donation-form">
              <div className="form-group">
                <label>Donation Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  min="1"
                  data-testid="amount-input"
                />
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your name"
                  required
                  data-testid="donor-name-input"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  data-testid="donor-phone-input"
                />
              </div>
              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message for cancer patients and poor people..."
                  rows={3}
                  data-testid="message-input"
                />
              </div>

              <div className="donation-breakdown">
                <h4>Your Impact:</h4>
                <div className="breakdown-item">
                  <span>💚 Charity Contribution:</span>
                  <span>₹5</span>
                </div>
                <div className="breakdown-item">
                  <span>🎁 VIP Gift Income (2%):</span>
                  <span>₹{(parseFloat(amount || 0) * 0.02).toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>🔒 Family Equity (60%):</span>
                  <span>₹{(parseFloat(amount || 0) * 0.60).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary full-width" disabled={loading} data-testid="submit-donation-btn">
                {loading ? "Recording..." : "Record Donation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
