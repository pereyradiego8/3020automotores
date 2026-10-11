'use client';
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');
    try { const supabase=createClient(); const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; window.location.href='/admin'; }
    catch { setError('No se pudo iniciar sesión. Revisá tus datos o la configuración de Supabase.'); }
    finally { setBusy(false); }
  }
  return <main className="section"><div className="wrap" style={{maxWidth:520}}><span className="eyebrow" style={{color:'var(--accent)'}}>Acceso del personal</span><h1 className="page-title">Panel de administración</h1><p className="muted">Ingresá con una cuenta habilitada por el administrador del sistema.</p><form onSubmit={submit} className="contact" style={{display:'grid',gap:14}}><label>Correo electrónico<input className="field" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input className="field" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" style={{color:'var(--accent)'}}>{error}</p>}<button className="button" disabled={busy}>{busy?'Ingresando…':'Iniciar sesión'}</button></form><p className="muted" style={{fontSize:12}}>Las cuentas deben crearse y autorizarse en Supabase; no hay registro público.</p></div></main>;
}
