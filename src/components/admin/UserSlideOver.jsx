import { useEffect, useState, useRef } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { X, Pencil } from 'lucide-react';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'prof', label: 'Professeur' },
  { value: 'etudiant', label: 'Étudiant' },
];

const SIDEBAR_WIDTH_PX = 256;

export default function UserSlideOver({ open, mode = 'create', initialUser, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ nom: '', email: '', role: 'etudiant', password: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialUser) {
      setForm({ nom: initialUser.nom || '', email: initialUser.email || '', role: initialUser.role || 'etudiant', password: '' });
      setAvatar(null);
      setAvatarPreview(initialUser.avatarUrl || '');
    } else {
      setForm({ nom: '', email: '', role: 'etudiant', password: '' });
      setAvatar(null);
      setAvatarPreview('');
    }
  }, [open, mode, initialUser]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    setAvatar(file || null);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const openFilePicker = () => fileRef.current?.click();

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (avatar) payload.avatar = avatar;
    onSubmit?.(payload);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0'} bg-slate-900/20 backdrop-blur-[1px]`}
        style={{ left: `${SIDEBAR_WIDTH_PX}px` }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-0 right-0 h-screen bg-white border-l border-slate-200 shadow-xl flex flex-col will-change-transform transition-transform duration-300 ${open ? 'translate-x-0 ease-out' : 'translate-x-full ease-in'}`}
        style={{ width: `calc((100vw - ${SIDEBAR_WIDTH_PX}px) / 2)` }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{mode === 'edit' ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator />

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-6">
          {/* Avatar centré */}
          <section className="space-y-3">
            <div className="w-full flex items-center justify-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="h-28 w-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border hover:ring-2 hover:ring-slate-200 transition"
                  aria-label="Changer l'avatar"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">Avatar</span>
                  )}
                </button>
                {/* Icône d’édition */}
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border shadow flex items-center justify-center">
                  <Pencil className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </div>
            <input ref={fileRef} id="avatar" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </section>

          <Separator />

          {/* Identité */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </section>

          <Separator />

          {/* Rôle */}
          <section className="space-y-2">
            <Label>Rôle</Label>
            <Select
              value={form.role}
              onChange={(val) => setForm((f) => ({ ...f, role: val }))}
              options={roles}
              placeholder="Sélectionner un rôle"
            />
          </section>

          <Separator />

          {/* Sécurité */}
          {mode === 'create' ? (
            <section className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />
            </section>
          ) : (
            <section className="space-y-2">
              <Label htmlFor="password">Mot de passe (laisser vide pour ne pas changer)</Label>
              <Input id="password" type="password" name="password" value={form.password} onChange={handleChange} />
            </section>
          )}
        </form>

        <Separator />
        <div className="p-3 px-4 bg-white flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>{submitting ? 'En cours...' : (mode === 'edit' ? 'Enregistrer' : 'Créer')}</Button>
        </div>
      </div>
    </div>
  );
}
