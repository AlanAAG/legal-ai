import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Mail, Lock, AlertCircle, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Bug 2 fix: Redirect already-authenticated users away from /login
  useEffect(() => {
    if (user) {
      navigate('/operaciones', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError('Credenciales incorrectas. Por favor, intente de nuevo.');
        }
        // Navigation handled by the useEffect above when `user` changes
      } else {
        const { error: signUpError, user: newUser } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError.message);
        } else if (newUser?.confirmed_at || newUser?.email_confirmed_at) {
          // Email confirmation is DISABLED — user is already confirmed
          // The onAuthStateChange listener will pick this up and redirect via useEffect
        } else {
          // Email confirmation is ENABLED — show "check your email" screen
          setIsSignedUp(true);
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Intente más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear errors when toggling between modes
  const toggleMode = () => {
    setError(null);
    setIsLogin(!isLogin);
  };

  if (isSignedUp) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto border border-green-100">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#001529]">¡Casi listo!</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Hemos enviado un enlace de confirmación a <span className="font-bold text-slate-800">{email}</span>. 
              Por favor revisa tu bandeja de entrada para activar tu cuenta.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsSignedUp(false);
              setIsLogin(true);
            }}
            className="w-full bg-[#001529] text-white py-4 rounded-2xl font-black text-sm"
          >
            Volver al inicio de sesión
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#9C7E46] rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Layout className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#001529] tracking-tight">Broker Deal Room</h1>
          <p className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mt-2">Acceso a Gestión Documental</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta de Agente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">
                    Nombre Completo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-300 group-focus-within:text-[#C5A059] transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-[#C5A059] transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all"
                    placeholder="ejemplo@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-[#C5A059] transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-sm focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-xs font-medium"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#001529] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#002140] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={toggleMode}
                className="text-xs font-bold text-[#C5A059] hover:underline"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs">
          ¿Problemas para acceder? Contacte a soporte@brokerdealroom.mx
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
