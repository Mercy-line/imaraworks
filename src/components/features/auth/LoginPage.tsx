import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  HardHat,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Building,
  ArrowRight,
  UserCheck,
  Briefcase,
  DollarSign,
  Shield,
} from 'lucide-react';
import { Button } from '../../common/Button';

export const LoginPage: React.FC = () => {
  const { login, demoUsers } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('alice@imaraworks.co.ke');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your company email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(email, password);
      showToast('success', 'Welcome to ImaraPay', 'You are signed in to ImaraWorks Operations.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(userEmail, 'password123');
      showToast('success', 'Logged In', `Authenticated as ${userEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'EMPLOYEE':
        return <UserCheck size={14} className="text-blue-600" />;
      case 'MANAGER':
        return <Briefcase size={14} className="text-amber-600" />;
      case 'FINANCE':
        return <DollarSign size={14} className="text-emerald-600" />;
      case 'ADMIN':
        return <Shield size={14} className="text-purple-600" />;
      default:
        return <UserCheck size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg ring-4 ring-amber-500/20 mb-4">
          <HardHat size={32} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ImaraPay Operations
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Vendor Payment & Approval Governance | ImaraWorks Ltd.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-modal rounded-2xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                  placeholder="name@imaraworks.co.ke"
                  className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-2xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                  placeholder="••••••••••••"
                  className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 select-none">Remember this device</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full shadow-md"
                rightIcon={<ArrowRight size={15} />}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>

          {/* Quick Demo Personas Selector */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick Case Study Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u.email)}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {getRoleIcon(u.role)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-2xs font-bold text-slate-800 truncate">{u.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500 truncate capitalize">{u.role.toLowerCase()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security / Architecture Footer Notice */}
        <div className="mt-6 text-center text-2xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Secured with Django REST Framework authoritative permissions</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
};
