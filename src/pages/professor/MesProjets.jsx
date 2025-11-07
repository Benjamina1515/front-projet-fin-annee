import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { projectService } from '../../services/projectService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Users, BookOpen, X, Loader2, RefreshCw, Edit, Trash2 } from 'lucide-react';
import ProjectSlideOver from '../../components/professor/ProjectSlideOver';
import SujetsSlideOver from '../../components/professor/SujetsSlideOver';
import ProjectDetailsSlideOver from '../../components/professor/ProjectDetailsSlideOver';

const MesProjets = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateSlideOver, setOpenCreateSlideOver] = useState(false);
  const [openEditSlideOver, setOpenEditSlideOver] = useState(false);
  const [openSujetsSlideOver, setOpenSujetsSlideOver] = useState(false);
  const [openEditSujetModal, setOpenEditSujetModal] = useState(false);
  const [openDetailsSlideOver, setOpenDetailsSlideOver] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [editingProjet, setEditingProjet] = useState(null);
  const [editingSujet, setEditingSujet] = useState(null);
  const [repartirLoading, setRepartirLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingSujet, setSubmittingSujet] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    loadProjets();
  }, []);

  const loadProjets = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjets(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    if (!editingProjet) return;
    
    // Validation côté client
    if (formData.niveaux.length === 0) {
      toast.error('Veuillez sélectionner un niveau');
      return;
    }
    
    if (!formData.date_debut || !formData.date_fin) {
      toast.error('Veuillez sélectionner les dates de début et de fin');
      return;
    }
    
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      toast.error('La date de fin doit être postérieure à la date de début');
      return;
    }
    
    try {
      setSubmitting(true);
      const updatedProjet = await projectService.updateProject(editingProjet.id, formData);
      toast.success('Projet mis à jour avec succès !');
      setOpenEditSlideOver(false);
      setEditingProjet(null);
      await loadProjets();
      
      // Mettre à jour le projet sélectionné si le slideOver de détails est ouvert
      if (selectedProjet && selectedProjet.id === editingProjet.id && openDetailsSlideOver) {
        if (updatedProjet) {
          setSelectedProjet(updatedProjet);
        } else {
          // Si le backend ne retourne pas le projet complet, le recharger
          const reloadedProjet = await projectService.getProjectById(editingProjet.id);
          setSelectedProjet(reloadedProjet);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du projet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (projetId) => {
    try {
      const projet = await projectService.getProjectById(projetId);
      setEditingProjet(projet);
      setOpenEditSlideOver(true);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      toast.error('Erreur lors du chargement du projet');
    }
  };

  const handleCreateProject = async (formData) => {
    // Validation côté client
    if (formData.niveaux.length === 0) {
      toast.error('Veuillez sélectionner un niveau');
      return;
    }
    
    if (!formData.date_debut || !formData.date_fin) {
      toast.error('Veuillez sélectionner les dates de début et de fin');
      return;
    }
    
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      toast.error('La date de fin doit être postérieure à la date de début');
      return;
    }
    
    try {
      setSubmitting(true);
      const projet = await projectService.createProject(formData);
      toast.success('Projet créé avec succès !');
      setOpenCreateSlideOver(false);
      await loadProjets();
      // Ouvrir le SlideOver pour ajouter des sujets
      setSelectedProjet(projet);
      setOpenSujetsSlideOver(true);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du projet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSujets = async (validSujets) => {
    if (!selectedProjet) return;

    try {
      setSubmitting(true);
      // Ajouter tous les sujets
      for (const sujet of validSujets) {
        await projectService.addSujet({
          projet_id: selectedProjet.id,
          titre_sujet: sujet.titre_sujet,
          description: sujet.description || null,
        });
      }

      toast.success(`${validSujets.length} sujet(s) ajouté(s) avec succès !`);
      setOpenSujetsSlideOver(false);
      await loadProjets();
      
      // Ouvrir le slideOver de détails pour permettre à l'utilisateur de répartir manuellement
      if (selectedProjet) {
        const updatedProjet = await projectService.getProjectById(selectedProjet.id);
        setSelectedProjet(updatedProjet);
        setOpenDetailsSlideOver(true);
      } else {
        setSelectedProjet(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des sujets:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout des sujets');
      setSelectedProjet(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepartirEtudiants = async (projetId) => {
    try {
      setRepartirLoading(true);
      const projet = await projectService.repartirEtudiants(projetId);
      toast.success('Répartition effectuée avec succès !');
      await loadProjets();
      
      // Mettre à jour le projet sélectionné si le slideOver est déjà ouvert
      if (selectedProjet && selectedProjet.id === projetId && openDetailsSlideOver) {
        setSelectedProjet(projet);
      } else if (!openDetailsSlideOver) {
        // Ouvrir le slideOver de détails seulement s'il n'est pas déjà ouvert
        setSelectedProjet(projet);
        setOpenDetailsSlideOver(true);
      } else {
        // Mettre à jour le projet sélectionné
        setSelectedProjet(projet);
      }
      
      return projet;
    } catch (error) {
      console.error('Erreur lors de la répartition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la répartition');
      throw error;
    } finally {
      setRepartirLoading(false);
    }
  };

  const handleEditSujet = async (updatedProjet) => {
    // Mettre à jour le projet sélectionné avec les nouvelles données
    if (updatedProjet && selectedProjet && updatedProjet.id === selectedProjet.id) {
      setSelectedProjet(updatedProjet);
    }
    // Recharger la liste des projets
    await loadProjets();
  };

  const handleUpdateSujet = async (formData) => {
    if (!editingSujet) return;

    if (!formData.titre_sujet || formData.titre_sujet.trim() === '') {
      toast.error('Le titre du sujet est requis');
      return;
    }

    try {
      setSubmittingSujet(true);
      await projectService.updateSujet(editingSujet.id, {
        titre_sujet: formData.titre_sujet,
        description: formData.description || null,
      });
      toast.success('Sujet mis à jour avec succès !');
      setOpenEditSujetModal(false);
      setEditingSujet(null);
      // Recharger les détails du projet
      if (selectedProjet) {
        const updatedProjet = await projectService.getProjectById(selectedProjet.id);
        setSelectedProjet(updatedProjet);
      }
      await loadProjets();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sujet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du sujet');
    } finally {
      setSubmittingSujet(false);
    }
  };

  const handleDeleteProject = (projetId) => {
    // Trouver le projet à supprimer pour afficher son titre dans la modal
    const projet = projets.find(p => p.id === projetId);
    setProjectToDelete({ id: projetId, titre: projet?.titre || 'ce projet' });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingProjectId(projectToDelete.id);
      await projectService.deleteProject(projectToDelete.id);
      toast.success('Projet supprimé avec succès !');
      await loadProjets();
      // Fermer le slideOver de détails si le projet supprimé était affiché
      if (selectedProjet && selectedProjet.id === projectToDelete.id) {
        setOpenDetailsSlideOver(false);
        setSelectedProjet(null);
      }
      // Fermer la modal
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du projet');
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleViewDetails = async (projetId) => {
    try {
      const projet = await projectService.getProjectById(projetId);
      setSelectedProjet(projet);
      setOpenDetailsSlideOver(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-2">Gérez vos projets et répartissez vos étudiants en groupes</p>
        </div>
        <Button onClick={() => setOpenCreateSlideOver(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {projets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier projet</p>
            <Button onClick={() => setOpenCreateSlideOver(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projets.map((projet) => (
            <Card key={projet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{projet.titre}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {projet.description || 'Aucune description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Groupes créés</span>
                    <span className="font-semibold">{projet.nb_groupes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sujets</span>
                    <span className="font-semibold">{projet.nb_sujets || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Étudiants par groupe</span>
                    <span className="font-semibold">{projet.nb_par_groupe}</span>
                  </div>
                  {projet.niveaux && projet.niveaux.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Niveaux</span>
                      <span className="font-semibold">{projet.niveaux.join(', ')}</span>
                    </div>
                  )}
                  {projet.date_debut && projet.date_fin && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Période</span>
                      <span className="font-semibold text-xs">
                        {new Date(projet.date_debut).toLocaleDateString('fr-FR')} - {new Date(projet.date_fin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(projet.id)}
                      >
                        Détails
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => handleEditProject(projet.id)}
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full gap-2 text-white"
                      onClick={() => handleDeleteProject(projet.id)}
                      disabled={deletingProjectId === projet.id}
                    >
                      {deletingProjectId === projet.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </>
                      )}
                    </Button>
                    {projet.nb_sujets > 0 && projet.nb_groupes === 0 && (
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleRepartirEtudiants(projet.id)}
                        disabled={repartirLoading}
                      >
                        {repartirLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Répartition...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Répartir automatiquement
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SlideOver Création Projet */}
      <ProjectSlideOver
        open={openCreateSlideOver}
        mode="create"
        onClose={() => setOpenCreateSlideOver(false)}
        onSubmit={handleCreateProject}
        submitting={submitting}
      />

      {/* SlideOver Modification Projet */}
      <ProjectSlideOver
        open={openEditSlideOver}
        mode="edit"
        initialProject={editingProjet}
        onClose={() => {
          setOpenEditSlideOver(false);
          setEditingProjet(null);
        }}
        onSubmit={handleUpdateProject}
        submitting={submitting}
      />

      {/* SlideOver Ajout Sujets */}
      <SujetsSlideOver
        open={openSujetsSlideOver}
        projetId={selectedProjet?.id}
        projetTitre={selectedProjet?.titre}
        onClose={() => {
          setOpenSujetsSlideOver(false);
          setSelectedProjet(null);
        }}
        onSubmit={handleSaveSujets}
        submitting={submitting}
      />

      {/* Modal Modification Sujet */}
      <Dialog open={openEditSujetModal} onOpenChange={setOpenEditSujetModal}>
        <DialogContent className="sm:max-w-[500px] z-[60]">
          <DialogHeader>
            <DialogTitle>Modifier le sujet</DialogTitle>
            <DialogDescription>
              Modifiez les informations du sujet
            </DialogDescription>
          </DialogHeader>
          {editingSujet && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_titre_sujet">Titre du sujet *</Label>
                <Input
                  id="edit_titre_sujet"
                  placeholder="Titre du sujet (ex: Application mobile)"
                  value={editingSujet.titre_sujet || ''}
                  onChange={(e) => setEditingSujet({ ...editingSujet, titre_sujet: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description_sujet">Description</Label>
                <Textarea
                  id="edit_description_sujet"
                  placeholder="Description du sujet (optionnel)"
                  value={editingSujet.description || ''}
                  onChange={(e) => setEditingSujet({ ...editingSujet, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpenEditSujetModal(false);
                setEditingSujet(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleUpdateSujet(editingSujet)}
              disabled={submittingSujet || !editingSujet?.titre_sujet?.trim()}
            >
              {submittingSujet ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SlideOver Détails Projet */}
      <ProjectDetailsSlideOver
        open={openDetailsSlideOver}
        projet={selectedProjet}
        onClose={() => {
          setOpenDetailsSlideOver(false);
          setSelectedProjet(null);
        }}
        onRepartir={handleRepartirEtudiants}
        onEditSujet={handleEditSujet}
        repartirLoading={repartirLoading}
      />

      {/* Modal de confirmation de suppression */}
      <Dialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setProjectToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] z-[60]">
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet <strong>{projectToDelete?.titre}</strong> ?
              <br />
              <br />
              Cette action est irréversible et supprimera également tous les sujets et groupes associés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={deletingProjectId === projectToDelete?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingProjectId === projectToDelete?.id}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingProjectId === projectToDelete?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MesProjets;

