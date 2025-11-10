import { useState, useEffect, useMemo } from 'react';
import { projectService } from '../../services/projectService';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { Input } from '../../components/ui/input';
import { Search, BookOpen, Users, Calendar, User, Hash } from 'lucide-react';
import { toast } from 'react-toastify';
import { Skeleton } from '../../components/ui/skeleton';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const ProjectsManagement = () => {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjectsAdmin();
      setProjets(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projets;
    
    return projets.filter(projet =>
      (projet.titre || '').toLowerCase().includes(q) ||
      (projet.prof?.nom || '').toLowerCase().includes(q) ||
      (projet.prof?.email || '').toLowerCase().includes(q)
    );
  }, [projets, query]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjets = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Skeleton pour le chargement
  const TableSkeleton = () => (
    <>
      {[...Array(10)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Projets</h1>
          <p className="text-gray-600 mt-1">Visualisez tous les projets créés par les professeurs</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher par titre, nom du professeur ou email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      ID
                    </div>
                  </TableHead>
                  <TableHead className="w-[300px]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      Titre du projet
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Professeur
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      Nombre de groupes
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Date de début
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Deadline
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : paginatedProjets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {query ? 'Aucun projet trouvé pour cette recherche' : 'Aucun projet disponible'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjets.map((projet, index) => (
                    <TableRow key={projet.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="font-semibold text-gray-900">{projet.titre}</div>
                      </TableCell>
                      <TableCell>
                        {projet.prof ? (
                          <span className="font-medium text-gray-900">{projet.prof.nom || '-'}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{projet.nb_groupes || 0}</span>
                          <span className="text-sm text-gray-500">groupe{projet.nb_groupes !== 1 ? 's' : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {formatDate(projet.date_debut)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {formatDate(projet.date_fin)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filtered.length)} sur {filtered.length} projet{filtered.length !== 1 ? 's' : ''}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Afficher seulement les pages proches de la page actuelle
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
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
        </div>
      </Card>
    </div>
  );
};

export default ProjectsManagement;

