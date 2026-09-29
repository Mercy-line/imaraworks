import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { authApi } from '../../../api/authApi';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Mail, KeyRound, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.requestPasswordReset(email);
      setIsSuccess(true);
      showToast('success', 'Reset Dispatched', res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to request reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <KeyRound size={22} />
        </div>
        <h3 className="text-base font-bold text-slate-900">Reset ImaraPay Password</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enter your company email to receive a password reset verification link.
        </p>

        {isSuccess ? (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-left space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Reset link dispatched</span>
            </div>
            <p className="text-2xs text-emerald-700 leading-relaxed">
              If <strong className="text-emerald-900">{email}</strong> exists in the directory, check your inbox for instructions.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="outline" className="w-full" onClick={handleClose}>
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@imaraworks.co.ke"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button size="sm" type="submit" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
