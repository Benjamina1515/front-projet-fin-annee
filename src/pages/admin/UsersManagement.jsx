import { useState, useEffect, useMemo } from 'react';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { MoreVertical, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import UserSlideOver from '../../components/admin/UserSlideOver';
import { getAvatarUrl } from '../../utils/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const UsersManagement = ({ roleFilter }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('create');
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        // Pour la création, inclure tous les champs selon le rôle
        const payload = { 
          nom: data.nom, 
          email: data.email, 
          role: data.role, 
          password: data.password 
        };
        
        // Ajouter les champs spécifiques selon le rôle
        if (data.role === 'prof') {
          payload.matricule = data.matricule;
          payload.specialite = data.specialite;
          payload.grade = data.grade;
        } else if (data.role === 'etudiant') {
          payload.matricule = data.matricule;
          payload.filiere = data.filiere;
          payload.niveau = data.niveau;
        }
        
        // Ajouter l'avatar si présent
        if (data.avatar && data.avatar instanceof File) {
          payload.avatar = data.avatar;
        }
        
        await userService.createUser(payload);
        toast.success('Utilisateur créé');
      } else if (panelMode === 'edit' && currentUser) {
        const payload = { nom: data.nom, email: data.email, role: data.role };
        if (data.password) payload.password = data.password;
        
        // Ajouter les champs spécifiques selon le rôle pour la modification
        if (data.role === 'prof') {
          payload.matricule = data.matricule;
          payload.specialite = data.specialite;
          payload.grade = data.grade;
        } else if (data.role === 'etudiant') {
          payload.matricule = data.matricule;
          payload.filiere = data.filiere;
          payload.niveau = data.niveau;
        }
        
        // Ajouter l'avatar seulement si c'est un nouveau fichier (File object)
        if (data.avatar && data.avatar instanceof File) {
          payload.avatar = data.avatar;
        }
        
        await userService.updateUser(currentUser.id, payload);
        toast.success('Utilisateur mis à jour');
      }
      setPanelOpen(false);
      fetchUsers();
      setCurrentPage(1); // Reset to first page after action
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('Utilisateur supprimé');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      // Adjust page if current page becomes empty
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (e) {
      toast.error("Suppression impossible");
    }
  };

  const filtered = useMemo(() => {
    let filteredUsers = users;
    
    // Appliquer le filtre de rôle si spécifié
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    
    // Appliquer la recherche
    const q = query.trim().toLowerCase();
    if (q) {
      filteredUsers = filteredUsers.filter(u =>
        (u.nom || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    }
    
    return filteredUsers;
  }, [users, query, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    // Reset to page 1 when search query or role filter changes
    setCurrentPage(1);
  }, [query, roleFilter]);

  return (
    <div className="space-y-6 relative">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {roleFilter === 'prof' ? 'Gestion des Professeurs' : 
             roleFilter === 'etudiant' ? 'Gestion des Étudiants' : 
             'User management'}
          </h1>
          <p className="text-sm text-gray-500">
            {roleFilter === 'prof' ? 'Gérer les professeurs et leurs informations.' :
             roleFilter === 'etudiant' ? 'Gérer les étudiants et leurs informations.' :
             'Manage users and their permissions.'}
          </p>
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
                {roleFilter === 'prof' ? (
                  <>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Grade</TableHead>
                  </>
                ) : roleFilter === 'etudiant' ? (
                  <>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Niveau</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Informations</TableHead>
                  </>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loader
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    {roleFilter === 'prof' ? (
                      <>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      </>
                    ) : roleFilter === 'etudiant' ? (
                      <>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={roleFilter ? 5 : 4} className="text-center text-sm text-gray-500 py-8">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img 
                            src={getAvatarUrl(u.avatar)} 
                            alt={u.nom} 
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`h-8 w-8 rounded-full bg-gray-200 ${u.avatar ? 'hidden' : 'flex items-center justify-center'}`}>
                          {!u.avatar && <span className="text-xs text-gray-400">{u.nom?.charAt(0)?.toUpperCase() || 'U'}</span>}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.nom}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    {roleFilter === 'prof' ? (
                      <>
                        <TableCell className="text-sm">{u.prof?.matricule || '-'}</TableCell>
                        <TableCell className="text-sm">{u.prof?.specialite || '-'}</TableCell>
                        <TableCell className="text-sm">{u.prof?.grade || '-'}</TableCell>
                      </>
                    ) : roleFilter === 'etudiant' ? (
                      <>
                        <TableCell className="text-sm">{u.etudiant?.matricule || '-'}</TableCell>
                        <TableCell className="text-sm">{u.etudiant?.filiere || '-'}</TableCell>
                        <TableCell className="text-sm">{u.etudiant?.niveau || '-'}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-sm">
                          {u.prof?.matricule || u.etudiant?.matricule || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {u.role === 'prof' ? (
                            <span>{u.prof?.specialite || '-'} / {u.prof?.grade || '-'}</span>
                          ) : u.role === 'etudiant' ? (
                            <span>{u.etudiant?.filiere || '-'} / {u.etudiant?.niveau || '-'}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" title="More">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(u)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(u)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      <UserSlideOver
        open={panelOpen}
        mode={panelMode}
        initialUser={currentUser}
        defaultRole={roleFilter}
        onClose={() => setPanelOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.nom}</strong> ({userToDelete?.email}) ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
