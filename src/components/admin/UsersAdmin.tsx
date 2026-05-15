'use client';
import { useEffect, useState } from 'react';
import {
  Search, UserPlus, Edit3, KeyRound, ShieldOff, ShieldCheck,
  Shield, Trash2, Loader2, X, Copy, Check, Activity, Power,
} from 'lucide-react';

type Role = 'ADMIN' | 'EDITOR';
type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  image: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  suspendedAt: string | null;
  has2fa: boolean;
};

type AuditEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  diff: any;
  ip: string | null;
  actorEmail: string | null;
  isActor: boolean;
  createdAt: string;
};

interface Props {
  initial: UserRow[];
  total: number;
  currentUserId: string;
}

export default function UsersAdmin({ initial, total: initialTotal, currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | Role>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'suspended'>('');

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [showTempPass, setShowTempPass] = useState<{ email: string; pass: string } | null>(null);

  async function refresh(p: { q?: string; role?: string; status?: string } = {}) {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      const qq = p.q ?? q;
      const r = p.role ?? roleFilter;
      const s = p.status ?? statusFilter;
      if (qq) sp.set('q', qq);
      if (r) sp.set('role', r);
      if (s) sp.set('status', s);
      const res = await fetch(`/api/users?${sp.toString()}`);
      const j = await res.json();
      if (j.ok) {
        setUsers(j.users);
        setTotal(j.total);
      }
    } finally { setLoading(false); }
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => refresh({ q }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function toggleSuspend(u: UserRow) {
    const next = !u.suspendedAt;
    const res = await fetch(`/api/users/${u.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: next }),
    });
    if (res.ok) refresh();
  }

  async function reset2fa(u: UserRow) {
    if (!confirm(`Réinitialiser la 2FA de ${u.email} ?`)) return;
    await fetch(`/api/users/${u.id}/reset-2fa`, { method: 'POST' });
    refresh();
  }

  async function resetPassword(u: UserRow) {
    if (!confirm(`Générer un nouveau mot de passe temporaire pour ${u.email} ?\nL'ancien sera invalidé.`)) return;
    const res = await fetch(`/api/users/${u.id}/reset-password`, { method: 'POST' });
    const j = await res.json();
    if (j.ok && j.tempPassword) {
      setShowTempPass({ email: u.email, pass: j.tempPassword });
    }
  }

  async function deleteUser(u: UserRow) {
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfirmDelete(null);
      refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par email ou nom…"
            className="input pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as any); refresh({ role: e.target.value }); }}
          className="input max-w-[160px]"
        >
          <option value="">Tous rôles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="EDITOR">EDITOR</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); refresh({ status: e.target.value }); }}
          className="input max-w-[160px]"
        >
          <option value="">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
        </select>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded text-sm"
        >
          <UserPlus size={14} /> Nouveau
        </button>
      </div>

      <div className="text-xs text-textMuted">
        {loading ? 'Chargement…' : `${total} utilisateur${total > 1 ? 's' : ''}`}
      </div>

      {/* Table */}
      <div className="bg-bgAlt border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg/50 text-textMuted text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Utilisateur</th>
                <th className="text-left px-3 py-2">Rôle</th>
                <th className="text-left px-3 py-2">Statut</th>
                <th className="text-left px-3 py-2">2FA</th>
                <th className="text-left px-3 py-2">Dernière connexion</th>
                <th className="text-left px-3 py-2">Créé le</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-bg/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar user={u} />
                        <div>
                          <div className="font-medium">{u.name || '—'}{isSelf && <span className="ml-1 text-xs text-primary">(toi)</span>}</div>
                          <div className="text-xs text-textMuted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2"><RoleBadge role={u.role} /></td>
                    <td className="px-3 py-2">
                      {u.suspendedAt
                        ? <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">Suspendu</span>
                        : <span className="text-xs px-2 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/30">Actif</span>}
                    </td>
                    <td className="px-3 py-2">
                      {u.has2fa
                        ? <span className="inline-flex items-center gap-1 text-xs text-primary"><ShieldCheck size={12} /> Activée</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-textMuted"><Shield size={12} /> —</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-textMuted">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR') : 'jamais'}
                    </td>
                    <td className="px-3 py-2 text-xs text-textMuted">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Modifier" onClick={() => setEditing(u)}><Edit3 size={14} /></IconBtn>
                        <IconBtn title="Reset password" onClick={() => resetPassword(u)}><KeyRound size={14} /></IconBtn>
                        <IconBtn title={u.suspendedAt ? 'Activer' : 'Suspendre'}
                          onClick={() => toggleSuspend(u)} disabled={isSelf}>
                          {u.suspendedAt ? <Power size={14} className="text-green-400" /> : <ShieldOff size={14} className="text-yellow-400" />}
                        </IconBtn>
                        <IconBtn title="Reset 2FA" onClick={() => reset2fa(u)} disabled={!u.has2fa}>
                          <Shield size={14} />
                        </IconBtn>
                        <IconBtn title="Supprimer" onClick={() => setConfirmDelete(u)} disabled={isSelf}>
                          <Trash2 size={14} className="text-red-400" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-textMuted text-sm">Aucun utilisateur</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u, tempPassword) => {
            setShowCreate(false);
            refresh();
            if (tempPassword) setShowTempPass({ email: u.email, pass: tempPassword });
          }}
        />
      )}

      {editing && (
        <EditUserModal
          user={editing}
          isSelf={editing.id === currentUserId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
          onTempPassword={(pass) => setShowTempPass({ email: editing.email, pass })}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Supprimer cet utilisateur ?"
          message={`Cette action est définitive : ${confirmDelete.email}`}
          confirmLabel="Supprimer"
          danger
          onConfirm={() => deleteUser(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showTempPass && (
        <TempPasswordModal
          email={showTempPass.email}
          pass={showTempPass.pass}
          onClose={() => setShowTempPass(null)}
        />
      )}
    </div>
  );
}

// ─────────────── Subcomponents ───────────────
function Avatar({ user }: { user: UserRow }) {
  const initial = (user.name || user.email).charAt(0).toUpperCase();
  if (user.image) {
    return <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-sm font-semibold text-primary">
      {initial}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const cls = role === 'ADMIN'
    ? 'bg-primary/20 text-primary border-primary/40'
    : 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  return <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{role}</span>;
}

function IconBtn({ children, onClick, title, disabled }: any) {
  return (
    <button
      type="button" title={title} disabled={disabled} onClick={onClick}
      className="p-1.5 rounded hover:bg-bgAlt text-textMuted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition"
    >{children}</button>
  );
}

function ModalShell({ children, onClose, wide }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-bgAlt border border-border rounded-lg shadow-xl ${wide ? 'max-w-2xl' : 'max-w-md'} w-full max-h-[90vh] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >{children}</div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserRow, tempPassword?: string) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || 'erreur');
      onCreated(j.user, j.tempPassword);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Nouvel utilisateur</h3>
          <button onClick={onClose}><X size={18} className="text-textMuted hover:text-text" /></button>
        </div>
        {error && <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}
        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs text-textMuted mb-1">Email *</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input" />
          </label>
          <label className="block">
            <span className="block text-xs text-textMuted mb-1">Nom (optionnel)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="block text-xs text-textMuted mb-1">Rôle</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
              <option value="EDITOR">EDITOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <p className="text-xs text-textMuted">
            Un mot de passe temporaire sera généré et affiché une seule fois.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border border-border hover:bg-bg">Annuler</button>
          <button onClick={submit} disabled={busy || !email}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded text-sm disabled:opacity-60">
            {busy && <Loader2 size={14} className="animate-spin" />} Créer
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function EditUserModal({
  user, isSelf, onClose, onSaved, onTempPassword,
}: {
  user: UserRow; isSelf: boolean;
  onClose: () => void; onSaved: () => void;
  onTempPassword: (pass: string) => void;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [name, setName] = useState(user.name || '');
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${user.id}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setAudit(j.audit ?? []); })
      .finally(() => setLoadingAudit(false));
  }, [user.id]);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, name }),
      });
      if (res.ok) onSaved();
    } finally { setBusy(false); }
  }

  async function resetPass() {
    if (!confirm('Générer un nouveau mot de passe ?')) return;
    const res = await fetch(`/api/users/${user.id}/reset-password`, { method: 'POST' });
    const j = await res.json();
    if (j.ok && j.tempPassword) onTempPassword(j.tempPassword);
  }

  async function reset2fa() {
    if (!confirm('Réinitialiser la 2FA ?')) return;
    await fetch(`/api/users/${user.id}/reset-2fa`, { method: 'POST' });
    onSaved();
  }

  return (
    <ModalShell onClose={onClose} wide>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl">Éditer {user.email}</h3>
            <p className="text-xs text-textMuted">Modifie le rôle, mot de passe, 2FA, et consulte l'audit.</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-textMuted hover:text-text" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs text-textMuted mb-1">Nom</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </label>
            <label className="block">
              <span className="block text-xs text-textMuted mb-1">Rôle</span>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input" disabled={isSelf}>
                <option value="EDITOR">EDITOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {isSelf && <span className="block text-[11px] text-textMuted mt-1">(impossible de changer ton propre rôle)</span>}
            </label>
            <button onClick={save} disabled={busy}
              className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm">
              {busy && <Loader2 size={12} className="animate-spin" />} Enregistrer
            </button>

            <hr className="border-border my-3" />

            <button onClick={resetPass}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-border hover:bg-bg text-sm">
              <KeyRound size={14} /> Réinitialiser mot de passe
            </button>
            <button onClick={reset2fa} disabled={!user.has2fa}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-border hover:bg-bg text-sm disabled:opacity-50">
              <Shield size={14} /> Réinitialiser 2FA {user.has2fa ? '' : '(non activée)'}
            </button>
          </div>

          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Activity size={14} /> Audit (20 dernières)</h4>
            <div className="border border-border rounded max-h-[320px] overflow-auto">
              {loadingAudit && <div className="p-3 text-xs text-textMuted">Chargement…</div>}
              {!loadingAudit && audit.length === 0 && <div className="p-3 text-xs text-textMuted">Aucune entrée</div>}
              {audit.map((a) => (
                <div key={a.id} className="px-3 py-2 border-b border-border last:border-b-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-primary">{a.action}</span>
                    <span className="text-textMuted">{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="text-textMuted mt-0.5">
                    {a.targetType}{a.targetId ? ` · ${a.targetId.slice(0,8)}` : ''}
                    {a.isActor ? ' (acteur)' : ' (cible)'}
                  </div>
                  {a.diff && (
                    <pre className="mt-1 text-[10px] text-textMuted overflow-x-auto">
                      {JSON.stringify(a.diff, null, 0).slice(0, 200)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }: any) {
  const [busy, setBusy] = useState(false);
  async function go() { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }
  return (
    <ModalShell onClose={onCancel}>
      <div className="p-5">
        <h3 className="font-display text-lg mb-2">{title}</h3>
        <p className="text-sm text-textMuted mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded border border-border hover:bg-bg">Annuler</button>
          <button onClick={go} disabled={busy}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm ${
              danger ? 'bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30' : 'btn-primary'
            }`}>
            {busy && <Loader2 size={14} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function TempPasswordModal({ email, pass, onClose }: { email: string; pass: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(pass).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <ModalShell onClose={onClose}>
      <div className="p-5">
        <h3 className="font-display text-lg mb-2 flex items-center gap-2"><KeyRound size={18} /> Mot de passe temporaire</h3>
        <p className="text-sm text-textMuted mb-3">
          Pour <span className="text-primary">{email}</span>. Copie-le maintenant — il ne sera plus affiché.
        </p>
        <div className="flex gap-2 mb-4">
          <code className="flex-1 bg-bg border border-border rounded px-3 py-2 font-mono text-sm break-all">{pass}</code>
          <button onClick={copy}
            className="px-3 py-2 rounded border border-border hover:bg-bg text-sm inline-flex items-center gap-1">
            {copied ? <><Check size={14} className="text-green-400" /> Copié</> : <><Copy size={14} /> Copier</>}
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="btn-primary px-4 py-2 rounded text-sm">Fermer</button>
        </div>
      </div>
    </ModalShell>
  );
}
