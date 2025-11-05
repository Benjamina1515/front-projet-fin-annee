import { useState, useEffect, useMemo } from 'react';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { MoreVertical, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import UserSlideOver from '../../components/admin/UserSlideOver';

const roleBadge = (role) => {
  const styles = {
    admin: 'bg-red-100 text-red-700',
    prof: 'bg-blue-100 text-blue-700',
    etudiant: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('create');
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const list = await userService.getAllUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setPanelMode('create');
    setCurrentUser(null);
    setPanelOpen(true);
  };

  const handleEdit = (u) => {
    setPanelMode('edit');
    setCurrentUser(u);
    setPanelOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (panelMode === 'create') {
        await userService.createUser(data);
        toast.success('Utilisateur créé');
      } else if (panelMode === 'edit' && currentUser) {
        const payload = { nom: data.nom, email: data.email, role: data.role };
        if (data.password) payload.password = data.password;
        if (data.avatar) payload.avatar = data.avatar;
        await userService.updateUser(currentUser.id, payload);
        toast.success('Utilisateur mis à jour');
      }
      setPanelOpen(false);
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await userService.deleteUser(id);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (e) {
      toast.error("Suppression impossible");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.nom || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User management</h1>
          <p className="text-sm text-gray-500">Manage users and their permissions.</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User name</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.nom}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(u)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="More">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500 py-8">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <UserSlideOver
        open={panelOpen}
        mode={panelMode}
        initialUser={currentUser}
        onClose={() => setPanelOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default UsersManagement;

