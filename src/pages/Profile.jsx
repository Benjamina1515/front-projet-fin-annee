import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, User as UserIcon, Shield, UploadCloud, Pencil, GraduationCap, Hash, Star, FolderKanban, CheckSquare, Clock } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { toast } from 'react-toastify';
import { getAvatarUrl } from '../utils/avatar';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    email: '',
    matricule: '',
    filiere: '',
    niveau: '',
    specialite: '',
    grade: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    lastLogin: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await authService.getProfile();
        setProfile(data?.user || data || user);
      } catch {
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    if (!user) load();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({
        nom: profile.nom || profile.name || '',
        email: profile.email || '',
        matricule: profile.prof?.matricule || profile.etudiant?.matricule || '',
        filiere: profile.etudiant?.filiere || '',
        niveau: profile.etudiant?.niveau || '',
        specialite: profile.prof?.specialite || '',
        grade: profile.prof?.grade || '',
      });
      const path = profile.avatar || profile.avatar_url || '';
      setAvatarPreview(path ? getAvatarUrl(path) : '');
    }
  }, [profile]);

  // Charger les statistiques (projets, tâches, dernière connexion)
  useEffect(() => {
    const loadStats = async () => {
      if (!profile?.role) return;
      
      try {
        setLoadingStats(true);
        let projectsCount = 0;
        let tasksCount = 0;

        // Récupérer les projets selon le rôle
        if (profile.role === 'etudiant') {
          const projects = await projectService.getStudentProjects();
          projectsCount = projects?.length || 0;
          
          const tasks = await taskService.getStudentTasks();
          tasksCount = tasks?.length || 0;
        } else if (profile.role === 'prof') {
          const projects = await projectService.getProfessorProjects();
          projectsCount = projects?.length || 0;
          
          const tasks = await taskService.getProfessorStudentTasks();
          tasksCount = tasks?.length || 0;
        } else if (profile.role === 'admin') {
          const projects = await projectService.getAllProjectsAdmin();
          projectsCount = projects?.length || 0;
        }

        setStats({
          projects: projectsCount,
          tasks: tasksCount,
          lastLogin: profile.last_login || profile.last_activity || profile.updated_at || null,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (profile) {
      loadStats();
    }
  }, [profile]);

  const initials = (profile?.name || profile?.nom || profile?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    try {
      setSaving(true);
      const payload = {
        nom: form.nom,
        email: form.email,
        role: profile.role,
      };
      if (profile.role === 'prof') {
        payload.matricule = form.matricule;
        payload.specialite = form.specialite;
        payload.grade = form.grade;
      } else if (profile.role === 'etudiant') {
        payload.matricule = form.matricule;
        payload.filiere = form.filiere;
        payload.niveau = form.niveau;
      }
      if (avatarFile) {
        payload.avatar = avatarFile;
      }

      // Si admin, on peut utiliser l'endpoint admin; sinon utiliser self-update
      if (profile.role === 'admin') {
        await userService.updateUser(profile.id, payload);
      } else {
        await authService.updateMe(payload);
      }
      const fresh = await refreshProfile();
      setProfile(fresh || { ...profile, ...payload });
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Mise à jour impossible');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        {!loading && (
          <div className="flex gap-2">
            {!editing ? (
              <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-2" onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(profile?.avatar ? getAvatarUrl(profile.avatar) : avatarPreview); }}>
                  Annuler
                </Button>
                <Button className="gap-2" onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="animate-pulse flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gray-200" />
            <div className="space-y-3">
              <div className="h-4 w-56 bg-gray-200 rounded" />
              <div className="h-3 w-72 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-blue-100 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                {editing && (
                  <label className="absolute -bottom-2 -right-2 cursor-pointer bg-white border shadow rounded-full p-2" title="Changer l'avatar">
                    <UploadCloud className="h-4 w-4 text-gray-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    {!editing ? (
                      <span className="truncate">{profile?.name || profile?.nom || '-'}</span>
                    ) : (
                      <div className="w-full max-w-xs">
                        <Label htmlFor="nom" className="sr-only">Nom</Label>
                        <Input id="nom" name="nom" value={form.nom} onChange={handleChange} />
                      </div>
                    )}
                  </div>
                  {profile?.role && (
                    <Badge className="bg-blue-900 text-white border capitalize border-blue-900">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {!editing ? (
                      <span className="truncate">{profile?.email || '-'}</span>
                    ) : (
                      <div className="w-full max-w-xs">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="h-4 w-4 text-red-400" />
                    <span>Accès: {profile?.role || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Champs spécifiques par rôle */}
            {profile?.role === 'etudiant' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Matricule</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span>{profile?.etudiant?.matricule || '-'}</span>
                    </div>
                  ) : (
                    <Input name="matricule" value={form.matricule} onChange={handleChange} placeholder="Ex: ETU2024001" />
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Filière</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span>{profile?.etudiant?.filiere || '-'}</span>
                    </div>
                  ) : (
                    <Input name="filiere" value={form.filiere} onChange={handleChange} placeholder="Ex: Informatique" />
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Niveau</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span>{profile?.etudiant?.niveau || '-'}</span>
                    </div>
                  ) : (
                    <Input name="niveau" value={form.niveau} onChange={handleChange} placeholder="Ex: L3" />
                  )}
                </div>
              </div>
            )}

            {profile?.role === 'prof' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Matricule</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span>{profile?.prof?.matricule || '-'}</span>
                    </div>
                  ) : (
                    <Input name="matricule" value={form.matricule} onChange={handleChange} placeholder="Ex: PROF2024001" />
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Spécialité</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span>{profile?.prof?.specialite || '-'}</span>
                    </div>
                  ) : (
                    <Input name="specialite" value={form.specialite} onChange={handleChange} placeholder="Ex: Mathématiques" />
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Grade</Label>
                  {!editing ? (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span>{profile?.prof?.grade || '-'}</span>
                    </div>
                  ) : (
                    <Input name="grade" value={form.grade} onChange={handleChange} placeholder="Ex: Maître de Conférences" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-2 border-blue-900/10 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Projets</p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.projects}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-900/10 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-blue-900" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-2 border-amber-500/10 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tâches</p>
                {loadingStats ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold text-amber-500 mt-1">{stats.tasks}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-2 border-blue-900/10 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Dernière connexion</p>
                {loadingStats ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                ) : stats.lastLogin ? (
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    {new Date(stats.lastLogin).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-gray-500 mt-1">Jamais</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-900/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-900" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;


