import { useState, useEffect, useMemo } from 'react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Skeleton } from '../../components/ui/skeleton';
import { BookOpen, Circle, GraduationCap, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const StudentProjects = () => {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [expandedProfs, setExpandedProfs] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      setLoading(true);
      const data = await projectService.getStudentProjects();
      setProjets(data || []);
      // Sélectionner le premier professeur par défaut
      if (data && data.length > 0) {
        const firstProf = data.find(p => p.prof && p.prof.id)?.prof;
        if (firstProf) {
          setSelectedProfId(firstProf.id);
          setExpandedProfs(new Set([firstProf.id]));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  // Regrouper les projets par professeur
  const projetsParProf = useMemo(() => {
    const grouped = {};
    projets.forEach(projet => {
      if (projet.prof && projet.prof.id) {
        const profId = projet.prof.id;
        if (!grouped[profId]) {
          grouped[profId] = {
            prof: projet.prof,
            projets: []
          };
        }
        grouped[profId].projets.push(projet);
      }
    });
    return grouped;
  }, [projets]);

  // Obtenir la liste des professeurs
  const professeurs = useMemo(() => {
    return Object.values(projetsParProf).map(item => item.prof);
  }, [projetsParProf]);

  // Filtrer les projets selon le professeur sélectionné
  const projetsFiltres = useMemo(() => {
    if (!selectedProfId) return projets;
    return projets.filter(projet => projet.prof && projet.prof.id === selectedProfId);
  }, [projets, selectedProfId]);

  // Toggle expansion d'un professeur
  const toggleProf = (profId) => {
    setExpandedProfs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profId)) {
        newSet.delete(profId);
      } else {
        newSet.add(profId);
      }
      return newSet;
    });
  };

  // Obtenir le nombre total de groupes pour chaque projet
  const getNombreGroupes = (projet) => {
    return projet.groupe ? 1 : 0;
  };

  // Obtenir tous les membres du groupe (incluant l'étudiant actuel si disponible)
  const getGroupMembers = (projet) => {
    // Utiliser 'membres' si disponible (inclut l'étudiant actuel), sinon utiliser 'coequipiers'
    if (projet.groupe?.membres && projet.groupe.membres.length > 0) {
      return projet.groupe.membres;
    }
    if (projet.groupe?.coequipiers) {
      return projet.groupe.coequipiers;
    }
    return [];
  };

  // Skeleton pour la sidebar
  const SidebarSkeleton = () => (
    <div className="w-80 bg-muted/30 border-r border-gray-200 p-6">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );

  // Skeleton pour les cartes
  const ProjectCardSkeleton = () => (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="space-y-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-16" />
            <div className="flex items-center gap-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full -ml-2" />
              <Skeleton className="h-8 w-8 rounded-full -ml-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarSkeleton />
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Mes Projets */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: sidebarCollapsed ? '80px' : '320px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-gray-100/50 border-r border-gray-200 flex flex-col relative transition-all duration-300`}
      >
        {/* Bouton pour réduire/agrandir */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
          aria-label={sidebarCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <div className={`p-6 border-b border-gray-200 bg-white ${sidebarCollapsed ? 'px-4' : ''}`}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <Circle className="h-3 w-3 fill-current text-gray-900" />
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Circle className="h-2 w-2 fill-current text-gray-900" />
              Projets par Professeur
            </h2>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className={`space-y-2 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {professeurs.length === 0 ? (
              <div className={`text-center py-8 text-gray-500 ${sidebarCollapsed ? 'text-xs' : 'text-sm'}`}>
                {sidebarCollapsed ? '•' : 'Aucun professeur disponible'}
              </div>
            ) : (
              <>
                {/* Option "Tous les projets" */}
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => setSelectedProfId(null)}
                    className={`
                      ${sidebarCollapsed ? 'p-3 justify-center' : 'p-4'} rounded-lg cursor-pointer transition-all duration-200 border flex items-center
                      ${selectedProfId === null
                        ? 'bg-white border-l-4 border-blue-600 shadow-sm'
                        : 'bg-white/70 hover:bg-white border-l-4 border-transparent hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                    title={sidebarCollapsed ? 'Tous les projets' : ''}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedProfId === null ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <BookOpen className={`h-5 w-5 ${
                          selectedProfId === null ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm ${
                            selectedProfId === null ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            Tous les projets
                          </h3>
                          <p className="text-xs text-gray-500">
                            {projets.length} projet{projets.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Liste des professeurs */}
                {professeurs.map((prof) => {
                  const profId = prof.id;
                  const profData = projetsParProf[profId];
                  const isSelected = selectedProfId === profId;
                  const isExpanded = expandedProfs.has(profId) && !sidebarCollapsed;
                  const nombreProjets = profData?.projets.length || 0;

                  return (
                    <div key={profId} className="space-y-1">
                      <motion.div
                        whileHover={{ y: -2, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`
                            ${sidebarCollapsed ? 'p-3 justify-center' : 'p-4'} rounded-lg cursor-pointer transition-all duration-200 border flex items-center
                            ${isSelected
                              ? 'bg-white border-l-4 border-blue-600 shadow-sm'
                              : 'bg-white/70 hover:bg-white border-l-4 border-transparent hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                          title={sidebarCollapsed ? prof.nom || 'Professeur inconnu' : ''}
                        >
                          <div
                            className={`flex items-center relative ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3 w-full'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfId(profId);
                              if (!sidebarCollapsed) {
                                toggleProf(profId);
                              }
                            }}
                          >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center relative ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <GraduationCap className={`h-5 w-5 ${
                                isSelected ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                              {sidebarCollapsed && nombreProjets > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            {!sidebarCollapsed && (
                              <>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-semibold text-sm truncate mb-1 ${
                                    isSelected ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {prof.nom || 'Professeur inconnu'}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {nombreProjets} projet{nombreProjets > 1 ? 's' : ''}
                                  </p>
                                </div>
                                {nombreProjets > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProf(profId);
                                    }}
                                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Liste des projets du professeur (expandable) - caché si sidebar réduite */}
                      {!sidebarCollapsed && (
                        <AnimatePresence>
                          {isExpanded && profData && profData.projets.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
                                {profData.projets.map((projet) => {
                                  const members = getGroupMembers(projet);
                                  return (
                                    <motion.div
                                      key={projet.id}
                                      whileHover={{ x: 4 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div
                                        onClick={() => {
                                          setSelectedProfId(profId);
                                          // Scroll vers le projet dans la zone principale
                                          const element = document.getElementById(`projet-${projet.id}`);
                                          if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                          }
                                        }}
                                        className="p-3 rounded-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                      >
                                        <h4 className="font-medium text-xs text-gray-900 truncate mb-1">
                                          {projet.titre}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                          {projet.groupe?.sujet?.titre_sujet || 'Sans sujet'}
                                        </p>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </motion.aside>

      {/* Zone principale - Liste des Projets */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold text-gray-900"
            >
              Liste des Projets
            </motion.h1>
            {selectedProfId && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {projetsParProf[selectedProfId]?.prof.nom || 'Professeur'}
              </Badge>
            )}
          </div>

          {projetsFiltres.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet</h3>
                <p className="text-gray-600 text-center max-w-md">
                  {selectedProfId 
                    ? "Aucun projet assigné par ce professeur."
                    : "Vous n'êtes actuellement assigné à aucun projet. Contactez votre professeur pour plus d'informations."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projetsFiltres.map((projet, index) => {
                const members = getGroupMembers(projet);
                const nombreGroupes = getNombreGroupes(projet);

                return (
                  <motion.div
                    id={`projet-${projet.id}`}
                    key={projet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all h-full cursor-pointer">
                      <CardHeader className="pb-2">
                        {/* Titre du projet */}
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
                          {projet.titre}
                        </CardTitle>

                        {/* Sujet du projet */}
                        {projet.groupe?.sujet?.titre_sujet && (
                          <CardDescription className="text-sm text-gray-600 line-clamp-1 mb-3">
                            Sujet: {projet.groupe.sujet.titre_sujet}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0 pb-3">
                        <div className="space-y-3">
                          {/* Badge nombre de groupes */}
                          <div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2.5 py-0.5">
                              {nombreGroupes} Groupe{nombreGroupes > 1 ? 's' : ''}
                            </Badge>
                          </div>

                          {/* Membres du groupe - sur une seule ligne */}
                          {members.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Membres :</p>
                              <div className="flex items-center gap-0 flex-1 min-w-0 overflow-hidden">
                                {members.map((member, idx) => (
                                  <motion.div
                                    key={member.id || idx}
                                    whileHover={{ scale: 1.15, zIndex: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-shrink-0"
                                  >
                                    <Avatar
                                      className="h-8 w-8 border-2 border-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                                      style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                                      title={member.nom || 'Membre'}
                                    >
                                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-[10px] font-semibold">
                                        {member.nom ? member.nom.charAt(0).toUpperCase() : '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </motion.div>
                                ))}
                                {members.length > 5 && (
                                  <span className="text-xs text-gray-500 ml-1">+{members.length - 5}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {members.length === 0 && (
                            <p className="text-xs text-gray-400 italic">Aucun membre dans ce groupe</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProjects;
