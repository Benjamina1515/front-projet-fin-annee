import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Pencil, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { profService } from '../../services/profService';

const CreateProf = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    matricule: '',
    specialite: '',
    grade: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    setAvatar(file || null);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview('');
    }
  };

  const openFilePicker = () => fileRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('matricule', form.matricule);
      formData.append('specialite', form.specialite);
      formData.append('grade', form.grade);
      
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await profService.createProf(formData);
      toast.success('Professeur créé avec succès');
      navigate('/professor');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.errors ? 
                          Object.values(error.response.data.errors).flat().join(', ') :
                          'Erreur lors de la création du professeur';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/professor')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Créer un Professeur</h1>
          <p className="text-sm text-gray-500">Remplissez tous les champs pour créer un nouveau professeur</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <section className="space-y-3">
            <Label>Photo de profil</Label>
            <div className="flex items-center justify-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="h-32 w-32 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 transition"
                  aria-label="Changer l'avatar"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Pencil className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-slate-400 text-xs">Ajouter photo</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatar}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Informations personnelles */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ex: jean.dupont@example.com"
                  required
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Informations professionnelles */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations professionnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule *</Label>
                <Input
                  id="matricule"
                  name="matricule"
                  value={form.matricule}
                  onChange={handleChange}
                  placeholder="Ex: PROF2024001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialite">Spécialité *</Label>
                <Input
                  id="specialite"
                  name="specialite"
                  value={form.specialite}
                  onChange={handleChange}
                  placeholder="Ex: Mathématiques"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Input
                  id="grade"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  placeholder="Ex: Maître de Conférences"
                  required
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Sécurité */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmer le mot de passe *</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Répétez le mot de passe"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/professor')}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Création en cours...' : 'Créer le professeur'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProf;

