import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  HardHat,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';
import {
  DEFAULT_SYSTEM_ACCOUNTS,
  getRegisteredAccounts,
  saveRegisteredAccount,
  SystemAccount,
} from '../utils/auth';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState<string>('admin@makassar.go.id');
  const [password, setPassword] = useState<string>('admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Form registrasi akun baru
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('surveyor');
  const [regAgency, setRegAgency] = useState<string>('Kokek Konsulting');

  // Handle pergantian tab role cepat
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'admin') {
      setEmail('admin@makassar.go.id');
      setPassword('admin');
    } else {
      setEmail('surveyor@makassar.go.id');
      setPassword('surveyor');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan isi email dan kata sandi.');
      return;
    }

    const accounts = getRegisteredAccounts();
    const matched = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      if (matched.password === password) {
        const { password: _, description: __, ...userObj } = matched;
        onLogin(userObj);
      } else {
        setErrorMessage('Kata sandi salah. Silakan periksa kembali.');
      }
    } else {
      // Jika email belum terdaftar di list default, izinkan login langsung dengan role terpilih
      const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = nameFromEmail
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: formattedName || (selectedRole === 'admin' ? 'Administrator Kokek' : 'Surveyor Lapangan'),
        email: email.trim(),
        role: selectedRole,
        roleTitle:
          selectedRole === 'admin' ? 'Administrator Kokek Konsulting' : 'Surveyor Lapangan Teknis',
        agency: 'Kokek Konsulting',
        avatarBg: selectedRole === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600',
        initials: formattedName ? formattedName.slice(0, 2).toUpperCase() : (selectedRole === 'admin' ? 'AH' : 'SV'),
      };

      onLogin(fallbackUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap.');
      return;
    }
    if (!regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Silakan lengkapi email dan kata sandi.');
      return;
    }

    const initials = regName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');

    const newAccount: SystemAccount = {
      id: `acc-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      roleTitle: regRole === 'admin' ? 'Administrator Kokek Konsulting' : 'Surveyor Lapangan Teknis',
      agency: regAgency.trim() || 'Kokek Konsulting',
      avatarBg: regRole === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600',
      initials: initials || (regRole === 'admin' ? 'AH' : 'SV'),
      description: `Akun ${regRole === 'admin' ? 'Administrator' : 'Surveyor'} terdaftar resmi.`,
    };

    saveRegisteredAccount(newAccount);
    setSuccessMessage(`Akun ${regRole.toUpperCase()} berhasil dibuat! Silakan login.`);
    setIsRegisterMode(false);
    setEmail(newAccount.email);
    setPassword(newAccount.password);
    setSelectedRole(newAccount.role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-sky-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-3.5">
            <Layers className="w-6.5 h-6.5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Makassar Ducting Survey</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
              V4
            </span>
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
            Sistem Informasi Penataan Kabel Bawah Tanah & Scoring Prioritas Kota Makassar
          </p>
        </div>

        {/* Card Login / Register Container */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl">
          {/* Header Switcher: Login vs Register */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
            <div className="flex items-center gap-2">
              {isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white">Daftar Akun Baru</h2>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white">Masuk ke Sistem</h2>
                </>
              )}
            </div>

            <button
              type="button"
              id="btn-toggle-register-mode"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              {isRegisterMode ? 'Sudah punya akun? Masuk' : '+ Buat Akun'}
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Mode 1: LOGIN */
            <div>
              {/* Role Selection Tabs (Admin & Surveyor) */}
              <div className="mb-5">
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Pilih Peran Akses:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    id="role-tab-admin"
                    onClick={() => handleRoleTabChange('admin')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Administrator</span>
                  </button>

                  <button
                    type="button"
                    id="role-tab-surveyor"
                    onClick={() => handleRoleTabChange('surveyor')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'surveyor'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Surveyor</span>
                  </button>
                </div>
              </div>

              {/* Account Quick Hint Card */}
              <div
                className={`p-3 rounded-xl border mb-5 text-xs transition-all flex items-start gap-2.5 ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                    selectedRole === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}
                >
                  {selectedRole === 'admin' ? 'AD' : 'SV'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>{selectedRole === 'admin' ? 'Administrator Kokek Konsulting' : 'Surveyor Lapangan Teknis'}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Email: <span className="font-mono text-white">{selectedRole === 'admin' ? 'admin@makassar.go.id' : 'surveyor@makassar.go.id'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Sandi: <span className="font-mono text-indigo-300 font-semibold">{selectedRole === 'admin' ? 'admin' : 'surveyor'}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email Kedinasan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      id="input-login-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@makassar.go.id"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Kata Sandi
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="input-login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>Ingat sesi masuk</span>
                  </label>
                  <span className="text-slate-500 text-[11px]">Sistem Terenkripsi SSL</span>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Masuk sebagai {selectedRole === 'admin' ? 'Admin' : 'Surveyor'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Mode 2: REGISTRASI AKUN BARU */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="contoh: Ir. Hasan Basri, S.T."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Peran / Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="surveyor">Surveyor Lapangan</option>
                    <option value="admin">Administrator Kokek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Instansi / Unit
                  </label>
                  <input
                    type="text"
                    value={regAgency}
                    onChange={(e) => setRegAgency(e.target.value)}
                    placeholder="Kokek Konsulting"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Kedinasan
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama@makassar.go.id"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-register"
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Daftar Akun {regRole === 'admin' ? 'Admin' : 'Surveyor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Footer Info */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pemerintah Kota Makassar</span>
            <span>Kokek Konsulting</span>
          </div>
        </div>
      </div>
    </div>
  );
};
