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
import { Plus, Users, BookOpen, X, Loader2, RefreshCw } from 'lucide-react';
import ProjectSlideOver from '../../components/professor/ProjectSlideOver';

const MesProjets = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateSlideOver, setOpenCreateSlideOver] = useState(false);
  const [openSujetsModal, setOpenSujetsModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [repartirLoading, setRepartirLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire sujets
  const [sujets, setSujets] = useState([{ titre_sujet: '', description: '' }]);

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
      // Ouvrir le modal pour ajouter des sujets
      setSelectedProjet(projet);
      setOpenSujetsModal(true);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du projet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSujet = () => {
    setSujets([...sujets, { titre_sujet: '', description: '' }]);
  };

  const handleRemoveSujet = (index) => {
    if (sujets.length > 1) {
      setSujets(sujets.filter((_, i) => i !== index));
    }
  };

  const handleSujetChange = (index, field, value) => {
    const newSujets = [...sujets];
    newSujets[index][field] = value;
    setSujets(newSujets);
  };

  const handleSaveSujets = async () => {
    if (!selectedProjet) return;

    try {
      // Valider qu'au moins un sujet a un titre
      const validSujets = sujets.filter(s => s.titre_sujet.trim() !== '');
      if (validSujets.length === 0) {
        toast.error('Veuillez ajouter au moins un sujet avec un titre');
        return;
      }

      // Ajouter tous les sujets
      for (const sujet of validSujets) {
        await projectService.addSujet({
          projet_id: selectedProjet.id,
          titre_sujet: sujet.titre_sujet,
          description: sujet.description || null,
        });
      }

      toast.success(`${validSujets.length} sujet(s) ajouté(s) avec succès !`);
      setOpenSujetsModal(false);
      setSujets([{ titre_sujet: '', description: '' }]);
      setSelectedProjet(null);
      await loadProjets();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des sujets:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout des sujets');
    }
  };

  const handleRepartirEtudiants = async (projetId) => {
    try {
      setRepartirLoading(true);
      const projet = await projectService.repartirEtudiants(projetId);
      toast.success('Répartition effectuée avec succès !');
      await loadProjets();
      // Ouvrir le modal de détails pour voir la répartition
      setSelectedProjet(projet);
      setOpenDetailsModal(true);
    } catch (error) {
      console.error('Erreur lors de la répartition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la répartition');
    } finally {
      setRepartirLoading(false);
    }
  };

  const handleViewDetails = async (projetId) => {
    try {
      const projet = await projectService.getProjectById(projetId);
      setSelectedProjet(projet);
      setOpenDetailsModal(true);
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
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(projet.id)}
                    >
                      Voir les détails
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
        onClose={() => setOpenCreateSlideOver(false)}
        onSubmit={handleCreateProject}
        submitting={submitting}
      />

      {/* Modal Ajout Sujets */}
      <Dialog open={openSujetsModal} onOpenChange={setOpenSujetsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter des sujets au projet</DialogTitle>
            <DialogDescription>
              Ajoutez plusieurs sujets (sous-projets) qui seront assignés aux groupes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {sujets.map((sujet, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Label className="text-sm font-medium">Sujet {index + 1}</Label>
                  {sujets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSujet(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Titre du sujet (ex: Application mobile)"
                    value={sujet.titre_sujet}
                    onChange={(e) => handleSujetChange(index, 'titre_sujet', e.target.value)}
                  />
                  <Textarea
                    placeholder="Description du sujet (optionnel)"
                    value={sujet.description}
                    onChange={(e) => handleSujetChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={handleAddSujet} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un sujet
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenSujetsModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveSujets}>Enregistrer les sujets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Détails Projet */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProjet?.titre}</DialogTitle>
            <DialogDescription>{selectedProjet?.description}</DialogDescription>
          </DialogHeader>
          {selectedProjet && (
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Nombre d'étudiants par groupe</Label>
                  <p className="font-semibold">{selectedProjet.nb_par_groupe}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Nombre de groupes</Label>
                  <p className="font-semibold">{selectedProjet.groupes?.length || 0}</p>
                </div>
                {selectedProjet.niveaux && selectedProjet.niveaux.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">Niveaux concernés</Label>
                    <p className="font-semibold">{selectedProjet.niveaux.join(', ')}</p>
                  </div>
                )}
                {selectedProjet.date_debut && selectedProjet.date_fin && (
                  <div>
                    <Label className="text-sm text-gray-600">Période</Label>
                    <p className="font-semibold text-sm">
                      {new Date(selectedProjet.date_debut).toLocaleDateString('fr-FR')} - {new Date(selectedProjet.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des sujets */}
              {selectedProjet.sujets && selectedProjet.sujets.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Sujets ({selectedProjet.sujets.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProjet.sujets.map((sujet) => (
                      <Card key={sujet.id} className="p-3">
                        <h4 className="font-medium">{sujet.titre_sujet}</h4>
                        {sujet.description && (
                          <p className="text-sm text-gray-600 mt-1">{sujet.description}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des groupes */}
              {selectedProjet.groupes && selectedProjet.groupes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Groupes ({selectedProjet.groupes.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedProjet.groupes.map((groupe) => (
                      <Card key={groupe.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">Groupe {groupe.numero_groupe}</h4>
                            {groupe.niveau && (
                              <p className="text-sm text-purple-600 mt-1 font-medium">
                                Niveau: {groupe.niveau}
                              </p>
                            )}
                            {groupe.sujet && (
                              <p className="text-sm text-blue-600 mt-1">
                                Sujet: {groupe.sujet.titre_sujet}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {groupe.nb_etudiants || groupe.etudiants?.length || 0} étudiant(s)
                          </span>
                        </div>
                        {groupe.etudiants && groupe.etudiants.length > 0 && (
                          <div className="space-y-1 mt-3 pt-3 border-t">
                            {groupe.etudiants.map((etudiant) => (
                              <div key={etudiant.id} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-medium">{etudiant.nom}</span>
                                  <span className="text-gray-600 ml-2">({etudiant.matricule})</span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {etudiant.filiere} - {etudiant.niveau}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedProjet.groupes || selectedProjet.groupes.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucun groupe créé pour le moment</p>
                  {selectedProjet.sujets && selectedProjet.sujets.length > 0 && (
                    <Button
                      className="mt-4 gap-2"
                      onClick={() => {
                        setOpenDetailsModal(false);
                        handleRepartirEtudiants(selectedProjet.id);
                      }}
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
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MesProjets;

