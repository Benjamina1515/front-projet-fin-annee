import { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { BookOpen, Users, User, Calendar, FileText, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';

const StudentProjects = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      setLoading(true);
      const data = await projectService.getStudentProjects();
      setProjets(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Skeleton pour le chargement
  const ProjectCardSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-2">Projets auxquels vous êtes assigné par vos professeurs</p>
        </div>
      </div>

      {projets.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-600 text-center max-w-md">
              Vous n'êtes actuellement assigné à aucun projet. Contactez votre professeur pour plus d'informations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projets.map((projet) => (
            <Card 
              key={projet.id} 
              className="hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg flex items-start gap-2 group-hover:text-blue-600 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{projet.titre}</span>
                  </CardTitle>
                </div>
                {projet.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {projet.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Professeur qui a assigné le projet */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-indigo-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">Professeur qui a assigné le projet</p>
                      {projet.prof && projet.prof.nom ? (
                        <p className="font-semibold text-sm text-gray-900 truncate">{projet.prof.nom}</p>
                      ) : (
                        <p className="font-semibold text-sm text-gray-500 italic">Non disponible</p>
                      )}
                    </div>
                  </div>

                  {/* Sujet assigné */}
                  {projet.groupe?.sujet && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <h4 className="font-semibold text-sm text-gray-900">Sujet assigné</h4>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <p className="font-semibold text-sm text-gray-900">{projet.groupe.sujet.titre_sujet}</p>
                        {projet.groupe.sujet.description && (
                          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{projet.groupe.sujet.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {(projet.date_debut || projet.date_fin) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-0.5">Période du projet</p>
                        <div className="flex flex-col gap-0.5">
                          {projet.date_debut && (
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">Début:</span> {formatDate(projet.date_debut)}
                            </p>
                          )}
                          {projet.date_fin && (
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">Deadline:</span> {formatDate(projet.date_fin)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Numéro de groupe */}
                  {projet.groupe?.numero_groupe && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Groupe {projet.groupe.numero_groupe}
                      </span>
                    </div>
                  )}

                  {/* Coéquipiers */}
                  {projet.groupe?.coequipiers && projet.groupe.coequipiers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-sm text-gray-900">
                          Coéquipiers ({projet.groupe.coequipiers.length})
                        </h4>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {projet.groupe.coequipiers.map((coequipier) => (
                          <div
                            key={coequipier.id}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                              <span className="text-green-700 font-semibold text-xs">
                                {coequipier.nom ? coequipier.nom.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{coequipier.nom || '-'}</p>
                              {coequipier.matricule && (
                                <p className="text-xs text-gray-500">Mat: {coequipier.matricule}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!projet.groupe?.coequipiers || projet.groupe.coequipiers.length === 0) && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-500 text-center">Vous êtes seul dans ce groupe</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProjects;

