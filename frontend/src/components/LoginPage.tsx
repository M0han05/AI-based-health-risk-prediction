import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Shield,
  Lock,
  User,
  Hospital,
  Eye,
  EyeOff,
  AlertCircle,
  Cpu,
  Globe,
  Brain,
  Fingerprint,
  UserPlus,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'hospital'>('admin');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setHospitalName('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    if (isRegisterMode) {
      // Registration flow
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      const result = await register(username, password, hospitalName);
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
      // Auth context auto-logs in on success — no extra action needed
    } else {
      // Login flow
      const result = login(username, password);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    }
    setIsLoading(false);
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.08),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/3 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 14}%`,
            animation: `float-particle ${3 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Panel - Branding */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Health Risk Prediction
              </h1>
              <p className="text-xs text-gray-500">Federated Learning Platform</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Secure Access to
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Privacy-Preserving
            </span>
            <br />
            Healthcare AI
          </h2>

          <p className="text-gray-400 mb-8 max-w-md mx-auto lg:mx-0">
            {isRegisterMode
              ? 'Register your hospital to access AI-powered health risk prediction with federated learning.'
              : 'Log in to access the federated learning platform. Your role determines the features available to you.'}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, label: 'End-to-End Encrypted', color: 'blue' },
              { icon: <Cpu className="w-3.5 h-3.5" />, label: 'Federated Learning', color: 'purple' },
              { icon: <Globe className="w-3.5 h-3.5" />, label: 'Multi-Hospital', color: 'cyan' },
              { icon: <Brain className="w-3.5 h-3.5" />, label: 'Explainable AI', color: 'amber' },
            ].map((pill, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 bg-${pill.color}-500/10 border border-${pill.color}-500/20 rounded-full px-3 py-1.5`}
              >
                <span className={`text-${pill.color}-400`}>{pill.icon}</span>
                <span className={`text-xs text-${pill.color}-300 font-medium`}>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login/Register Form */}
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
            {/* Role Selector - only in login mode */}
            {!isRegisterMode && (
              <div className="flex gap-2 mb-8 bg-gray-800/50 rounded-2xl p-1.5">
                <button
                  onClick={() => { setSelectedRole('admin'); resetForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  Admin Login
                </button>
                <button
                  onClick={() => { setSelectedRole('hospital'); resetForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedRole === 'hospital'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  <Hospital className="w-4 h-4" />
                  Hospital Login
                </button>
              </div>
            )}

            {/* Title */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isRegisterMode
                ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30'
                : selectedRole === 'admin'
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                  : 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30'
                }`}>
                {isRegisterMode ? (
                  <UserPlus className="w-7 h-7 text-amber-400" />
                ) : selectedRole === 'admin' ? (
                  <Lock className="w-7 h-7 text-blue-400" />
                ) : (
                  <Hospital className="w-7 h-7 text-emerald-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isRegisterMode
                  ? 'Hospital Registration'
                  : selectedRole === 'admin'
                    ? 'Administrator Access'
                    : 'Hospital Portal'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isRegisterMode
                  ? 'Create a new hospital account to get started'
                  : selectedRole === 'admin'
                    ? 'Full access to all system features'
                    : 'Access to patient registration, XAI & reports'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-5 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-300">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hospital Name - only in register mode */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hospital Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={e => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Hospital, AIIMS Delhi"
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={isRegisterMode ? 'Choose a username' : selectedRole === 'admin' ? 'Enter admin username' : 'Enter your username'}
                    className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 outline-none transition ${isRegisterMode
                      ? 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isRegisterMode ? 'Create a password (min 6 chars)' : 'Enter your password'}
                    className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-500 outline-none transition ${isRegisterMode
                      ? 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                    required
                    minLength={isRegisterMode ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password - only in register mode */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${isRegisterMode
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/20'
                  : selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : 'active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isRegisterMode ? 'Creating Account...' : 'Authenticating...'}
                  </>
                ) : (
                  <>
                    {isRegisterMode ? (
                      <><UserPlus className="w-4 h-4" /> Create Hospital Account</>
                    ) : (
                      <><Shield className="w-4 h-4" /> Sign In Securely</>
                    )}
                  </>
                )}
              </button>
            </form>

            {/* Toggle Login/Register & Quick Access */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              {isRegisterMode ? (
                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(false); setSelectedRole('hospital'); resetForm(); }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
                  >
                    Sign In
                  </button>
                </p>
              ) : selectedRole === 'admin' ? (
                <>
                  <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Access</p>
                  <button
                    type="button"
                    onClick={() => quickLogin('admin', 'admin123')}
                    className="w-full flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl px-4 py-2.5 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Admin Demo</span>
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-gray-400 font-mono transition">
                      Click to auto-fill
                    </span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-400">
                    New hospital?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsRegisterMode(true); resetForm(); }}
                      className="text-amber-400 hover:text-amber-300 font-semibold transition"
                    >
                      Register Here
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security badge and Reset */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="w-3 h-3" />
              <span className="text-[10px]">256-bit SSL Encrypted • HIPAA Compliant</span>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('WARNING: This will permanently wipe ALL registered hospitals and patient data from BOTH the browser and the SQL database. Proceed?')) {
                  try {
                    // 1. Wipe Backend SQL Database
                    await fetch('http://localhost:5000/api/fl/reset', { method: 'POST' });

                    // 2. Wipe Frontend Local Cache
                    localStorage.removeItem('registered_users');
                    sessionStorage.removeItem('auth_user');

                    alert('MASTER CLEAN: Full-stack reset successful! Database and local cache are now empty.');
                    window.location.reload();
                  } catch (err) {
                    alert('Reset failed. Make sure the backend server is running.');
                  }
                }
              }}
              className="text-[9px] mt-1 text-red-500/50 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-full font-mono transition-all"
            >
              RESET LOGIN STORAGE
            </button>
          </div>
        </div>
      </div>

      {/* CSS for floating particles */}
      <style>{`
        @keyframes float-particle {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          100% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
