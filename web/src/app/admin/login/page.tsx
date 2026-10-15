'use client';

import { type FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHero from '@/components/PageHero';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      window.location.href = '/admin';
    } catch {
      setError('No se pudo iniciar sesión. Revisá tus datos o la configuración de Supabase.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <PageHero compact eyebrow="Acceso del personal" title="Panel de administración"
        description="Ingresá con una cuenta habilitada para gestionar el inventario." />
      <section className="section admin-section">
        <div className="wrap admin-login-wrap">
          <form onSubmit={submit} className="contact admin-login-form">
            <h2>Iniciar sesión</h2>
            <label>Correo electrónico
              <input className="field" type="email" autoComplete="username" required
                value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>Contraseña
              <input className="field" type="password" autoComplete="current-password" required
                value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="notice" role="alert">{error}</p>}
            <button className="button" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button>
            <p className="muted admin-login-note">Las cuentas deben crearse y autorizarse en Supabase; no hay registro público.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
