import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { X, BookOpen, Users, Edit, Loader2, RefreshCw, Download, FileText, Check, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { projectService } from '../../services/projectService';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const SIDEBAR_WIDTH_PX = 256;

export default function ProjectDetailsSlideOver({ 
  open, 
  projet, 
  onClose, 
  onRepartir,
  onEditSujet,
  repartirLoading
}) {
  const tableRef = useRef(null);
  const [editingSujetId, setEditingSujetId] = useState(null);
  const [editingSujetData, setEditingSujetData] = useState({ titre_sujet: '', description: '' });
  const [updatingSujet, setUpdatingSujet] = useState(false);
  const [addingSujet, setAddingSujet] = useState(false);
  const [newSujetData, setNewSujetData] = useState({ titre_sujet: '', description: '' });
  const [deletingSujetId, setDeletingSujetId] = useState(null);
  const [sujetsModified, setSujetsModified] = useState(false);
  const [deleteSujetDialogOpen, setDeleteSujetDialogOpen] = useState(false);
  const [sujetToDelete, setSujetToDelete] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Réinitialiser l'état de modification quand le slideOver s'ouvre
  useEffect(() => {
    if (open) {
      setSujetsModified(false);
      setNewSujetData({ titre_sujet: '', description: '' });
    }
  }, [open]);

  // Transformer les données des groupes en lignes de tableau avec informations de fusion
  // IMPORTANT: Ce hook doit être appelé avant tout return conditionnel
  const tableData = useMemo(() => {
    if (!projet?.groupes || projet.groupes.length === 0) return [];
    
    const rows = [];
    projet.groupes.forEach((groupe) => {
      const etudiants = groupe.etudiants || [];
      const rowCount = Math.max(etudiants.length, 1); // Au moins une ligne même si groupe vide
      
      if (etudiants.length > 0) {
        etudiants.forEach((etudiant, index) => {
          rows.push({
            groupe: groupe.numero_groupe,
            sujet: groupe.sujet?.titre_sujet || '',
            nom: etudiant.nom,
            matricule: etudiant.matricule,
            filiere: etudiant.filiere,
            niveauEtudiant: etudiant.niveau,
            isFirstInGroup: index === 0,
            groupeId: groupe.id,
            rowSpan: index === 0 ? rowCount : 0 // rowSpan pour la fusion
          });
        });
      } else {
        // Groupe vide
        rows.push({
          groupe: groupe.numero_groupe,
          sujet: groupe.sujet?.titre_sujet || '',
          nom: '',
          matricule: '',
          filiere: '',
          niveauEtudiant: '',
          isFirstInGroup: true,
          groupeId: groupe.id,
          rowSpan: 1
        });
      }
    });
    return rows;
  }, [projet?.groupes]);

  if (!projet) return null;

  // Fonction pour démarrer l'édition d'un sujet
  const handleStartEditSujet = (sujet) => {
    setEditingSujetId(sujet.id);
    setEditingSujetData({
      titre_sujet: sujet.titre_sujet || '',
      description: sujet.description || ''
    });
  };

  // Fonction pour annuler l'édition
  const handleCancelEditSujet = () => {
    setEditingSujetId(null);
    setEditingSujetData({ titre_sujet: '', description: '' });
  };

  // Fonction pour sauvegarder les modifications d'un sujet
  const handleSaveSujet = async (sujetId) => {
    if (!editingSujetData.titre_sujet || editingSujetData.titre_sujet.trim() === '') {
      toast.error('Le titre du sujet est requis');
      return;
    }

    try {
      setUpdatingSujet(true);
      await projectService.updateSujet(sujetId, {
        titre_sujet: editingSujetData.titre_sujet,
        description: editingSujetData.description || null,
      });
      toast.success('Sujet mis à jour avec succès !');
      setEditingSujetId(null);
      setEditingSujetData({ titre_sujet: '', description: '' });
      
      // Recharger les données du projet et notifier le parent
      if (projet) {
        const updatedProjet = await projectService.getProjectById(projet.id);
        // Notifier le parent pour qu'il mette à jour le projet
        if (onEditSujet) {
          onEditSujet(updatedProjet);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sujet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du sujet');
    } finally {
      setUpdatingSujet(false);
    }
  };

  // Fonction pour ajouter un nouveau sujet
  const handleAddSujet = async () => {
    if (!newSujetData.titre_sujet || newSujetData.titre_sujet.trim() === '') {
      toast.error('Le titre du sujet est requis');
      return;
    }

    if (!projet) return;

    try {
      setAddingSujet(true);
      await projectService.addSujet({
        projet_id: projet.id,
        titre_sujet: newSujetData.titre_sujet,
        description: newSujetData.description || null,
      });
      toast.success('Sujet ajouté avec succès !');
      setNewSujetData({ titre_sujet: '', description: '' });
      setAddingSujet(false);
      setSujetsModified(true);
      
      // Recharger les données du projet
      const updatedProjet = await projectService.getProjectById(projet.id);
      if (onEditSujet) {
        onEditSujet(updatedProjet);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du sujet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du sujet');
    } finally {
      setAddingSujet(false);
    }
  };

  // Fonction pour ouvrir la modal de confirmation de suppression
  const handleDeleteSujetClick = (sujet) => {
    setSujetToDelete(sujet);
    setDeleteSujetDialogOpen(true);
  };

  // Fonction pour confirmer la suppression d'un sujet
  const handleConfirmDeleteSujet = async () => {
    if (!sujetToDelete) return;

    try {
      setDeletingSujetId(sujetToDelete.id);
      await projectService.deleteSujet(sujetToDelete.id);
      toast.success('Sujet supprimé avec succès !');
      setSujetsModified(true);
      setDeleteSujetDialogOpen(false);
      setSujetToDelete(null);
      
      // Recharger les données du projet
      if (projet) {
        const updatedProjet = await projectService.getProjectById(projet.id);
        if (onEditSujet) {
          onEditSujet(updatedProjet);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du sujet:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du sujet');
    } finally {
      setDeletingSujetId(null);
    }
  };

  // Fonction pour répartir les étudiants après modification des sujets
  const handleRepartirAfterModification = async () => {
    if (!projet) return;

    try {
      if (onRepartir) {
        await onRepartir(projet.id);
        setSujetsModified(false);
      }
    } catch (error) {
      console.error('Erreur lors de la répartition:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la répartition');
    }
  };

  // Fonction d'export CSV - Chaque ligne contient toutes les informations
  const exportToCSV = () => {
    if (tableData.length === 0 || !projet) return;

    const escapeCSV = (value) => {
      if (value === null || value === undefined || value === '') return '';
      const stringValue = String(value);
      // Si la valeur contient des virgules, guillemets ou sauts de ligne, l'entourer de guillemets
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Les en-têtes correspondent exactement à l'ordre des colonnes du tableau
    const headers = ['Groupe', 'Matricule', 'Nom', 'Filière', 'Niveau Étudiant', 'Sujet'];
    
    // Construire les lignes CSV - chaque ligne contient TOUTES les informations
    // (groupe et sujet pour toutes les lignes, pas seulement la première)
    const csvRows = tableData.map(row => {
      return [
        escapeCSV(row.groupe), // Toujours inclure le groupe pour chaque ligne
        escapeCSV(row.matricule),
        escapeCSV(row.nom),
        escapeCSV(row.filiere),
        escapeCSV(row.niveauEtudiant),
        escapeCSV(row.sujet) // Toujours inclure le sujet pour chaque ligne
      ].join(',');
    });
    
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // Ajouter BOM pour Excel UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const safeTitle = (projet.titre || 'projet').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle}_groupes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fonction d'export PDF avec capture du tableau HTML (style préservé)
  const exportToPDF = async () => {
    if (tableData.length === 0 || !projet || !tableRef.current) return;

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Titre du document
      doc.setFontSize(18);
      doc.text(projet.titre || 'Détails du projet', 14, 15);
      
      // Informations du projet
      doc.setFontSize(10);
      let yPos = 25;
      doc.text(`Nombre d'étudiants par groupe: ${projet.nb_par_groupe || 0}`, 14, yPos);
      yPos += 6;
      doc.text(`Nombre de groupes: ${projet.groupes?.length || 0}`, 14, yPos);
      if (projet.niveaux && projet.niveaux.length > 0) {
        yPos += 6;
        doc.text(`Niveaux: ${projet.niveaux.join(', ')}`, 14, yPos);
      }
      if (projet.date_debut && projet.date_fin) {
        yPos += 6;
        const dateDebut = new Date(projet.date_debut).toLocaleDateString('fr-FR');
        const dateFin = new Date(projet.date_fin).toLocaleDateString('fr-FR');
        doc.text(`Période: ${dateDebut} - ${dateFin}`, 14, yPos);
      }
      
      // Récupérer le conteneur du tableau (ref attaché au conteneur externe)
      const outerContainer = tableRef.current;
      const containerDiv = outerContainer.querySelector('div'); // div avec overflow-x-auto
      
      if (!outerContainer || !containerDiv) {
        console.error('Conteneurs non trouvés');
        return;
      }
      
      // Sauvegarder les styles originaux
      const originalOuterOverflow = outerContainer.style.overflow;
      const originalOuterMaxHeight = outerContainer.style.maxHeight;
      const originalInnerOverflow = containerDiv.style.overflow;
      const originalInnerMaxHeight = containerDiv.style.maxHeight;
      const originalInnerOverflowX = containerDiv.style.overflowX;
      const originalInnerOverflowY = containerDiv.style.overflowY;
      
      // Rendre tout le tableau visible pour la capture
      outerContainer.style.overflow = 'visible';
      outerContainer.style.maxHeight = 'none';
      containerDiv.style.overflow = 'visible';
      containerDiv.style.maxHeight = 'none';
      containerDiv.style.overflowX = 'visible';
      containerDiv.style.overflowY = 'visible';
      
      // Attendre que le rendu se stabilise
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capturer le conteneur complet avec html2canvas - options optimisées
      const canvas = await html2canvas(outerContainer, {
        scale: 3, // Haute qualité
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: false,
        imageTimeout: 15000,
        width: outerContainer.scrollWidth,
        height: outerContainer.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: outerContainer.scrollWidth,
        windowHeight: outerContainer.scrollHeight
      });
      
      // Restaurer les styles originaux
      outerContainer.style.overflow = originalOuterOverflow;
      outerContainer.style.maxHeight = originalOuterMaxHeight;
      containerDiv.style.overflow = originalInnerOverflow;
      containerDiv.style.maxHeight = originalInnerMaxHeight;
      containerDiv.style.overflowX = originalInnerOverflowX;
      containerDiv.style.overflowY = originalInnerOverflowY;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      
      // Calculer les dimensions pour occuper toute la largeur disponible
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Ajouter l'image du tableau au PDF avec pagination automatique améliorée
      let heightLeft = imgHeight;
      let position = yPos + 10;
      
      // Première page
      if (heightLeft > pageHeight - position - margin) {
        const firstPageHeight = pageHeight - position - margin;
        doc.addImage(imgData, 'PNG', margin, position, imgWidth, firstPageHeight);
        heightLeft -= firstPageHeight;
        
        // Pages supplémentaires avec meilleure gestion de la pagination
        let sourceY = 0;
        while (heightLeft > 0) {
          doc.addPage();
          const pageImgHeight = Math.min(heightLeft, pageHeight - margin * 2);
          const sourceHeight = (pageImgHeight / imgHeight) * canvas.height;
          
          // Créer un canvas temporaire pour la partie de l'image à afficher
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          const tempImgData = tempCanvas.toDataURL('image/png', 1.0);
          doc.addImage(tempImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
          
          heightLeft -= pageImgHeight;
          sourceY += sourceHeight;
        }
      } else {
        // L'image tient sur une seule page
        doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      }
      
      // Sauvegarder le PDF
      const safeTitle = (projet.titre || 'projet').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle}_groupes_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      // Fallback vers l'ancienne méthode si html2canvas échoue
      exportToPDFManual();
    }
  };

  // Fonction d'export PDF manuelle (fallback)
  const exportToPDFManual = () => {
    if (tableData.length === 0 || !projet) return;

    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Titre du document
    doc.setFontSize(18);
    doc.text(projet.titre || 'Détails du projet', 14, 15);
    
    // Informations du projet
    doc.setFontSize(10);
    let yPos = 25;
    doc.text(`Nombre d'étudiants par groupe: ${projet.nb_par_groupe || 0}`, 14, yPos);
    yPos += 6;
    doc.text(`Nombre de groupes: ${projet.groupes?.length || 0}`, 14, yPos);
    if (projet.niveaux && projet.niveaux.length > 0) {
      yPos += 6;
      doc.text(`Niveaux: ${projet.niveaux.join(', ')}`, 14, yPos);
    }
    if (projet.date_debut && projet.date_fin) {
      yPos += 6;
      const dateDebut = new Date(projet.date_debut).toLocaleDateString('fr-FR');
      const dateFin = new Date(projet.date_fin).toLocaleDateString('fr-FR');
      doc.text(`Période: ${dateDebut} - ${dateFin}`, 14, yPos);
    }
    
    // Configuration du tableau - optimiser les largeurs pour occuper toute la largeur
    const startY = yPos + 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const tableWidth = pageWidth - (margin * 2);
    
    // Calculer les largeurs de colonnes proportionnelles pour occuper toute la largeur
    // Ordre: Groupe, Matricule, Nom, Filière, Niveau Étudiant, Sujet
    const totalBaseWidth = 20 + 35 + 40 + 35 + 30 + 60; // Largeurs de base
    const scaleFactor = tableWidth / totalBaseWidth;
    const colWidths = [
      Math.round(20 * scaleFactor),  // Groupe
      Math.round(35 * scaleFactor),   // Matricule
      Math.round(40 * scaleFactor),   // Nom
      Math.round(35 * scaleFactor),   // Filière
      Math.round(30 * scaleFactor),   // Niveau Étudiant
      Math.round(60 * scaleFactor)    // Sujet
    ];
    
    const rowHeight = 8;
    const headerHeight = 10;
    
    // En-têtes du tableau avec alignement
    const headers = ['Groupe', 'Matricule', 'Nom', 'Filière', 'Niveau Étudiant', 'Sujet'];
    const headerAligns = ['center', 'left', 'left', 'left', 'left', 'center']; // Alignement des en-têtes
    
    // Dessiner l'en-tête
    doc.setFillColor(100, 100, 100);
    doc.rect(margin, startY, tableWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    let xPos = margin;
    headers.forEach((header, index) => {
      const align = headerAligns[index];
      const textX = align === 'center' ? xPos + colWidths[index] / 2 : xPos + 2;
      doc.text(header, textX, startY + headerHeight / 2 + 2, { align });
      xPos += colWidths[index];
    });
    
    // Dessiner les lignes du tableau avec fusion
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    
    let currentY = startY + headerHeight;
    let rowIndex = 0;
    
    // Grouper les données par groupeId pour la fusion
    const groupedData = [];
    let currentGroup = null;
    
    tableData.forEach((row, index) => {
      if (!currentGroup || currentGroup.groupeId !== row.groupeId) {
        if (currentGroup) groupedData.push(currentGroup);
        currentGroup = {
          groupeId: row.groupeId,
          groupe: row.groupe,
          sujet: row.sujet,
          rows: [row]
        };
      } else {
        currentGroup.rows.push(row);
      }
    });
    if (currentGroup) groupedData.push(currentGroup);
    
    // Dessiner le tableau avec fusions
    groupedData.forEach((group, groupIndex) => {
      const groupRowCount = group.rows.length;
      const groupHeight = groupRowCount * rowHeight;
      const groupStartY = currentY;
      
      group.rows.forEach((row, rowInGroup) => {
        // Vérifier si on doit créer une nouvelle page
        if (currentY + rowHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          currentY = margin;
          
          // Redessiner l'en-tête sur la nouvelle page
          doc.setFillColor(100, 100, 100);
          doc.rect(margin, currentY, tableWidth, headerHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          xPos = margin;
          headers.forEach((header, idx) => {
            const align = headerAligns[idx];
            const textX = align === 'center' ? xPos + colWidths[idx] / 2 : xPos + 2;
            doc.text(header, textX, currentY + headerHeight / 2 + 2, { align });
            xPos += colWidths[idx];
          });
          currentY += headerHeight;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(8);
          doc.setFont(undefined, 'normal');
        }
        
        // Ligne de séparation foncée avant le premier groupe (sauf le tout premier)
        if (groupIndex > 0 && rowInGroup === 0) {
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(0.5);
          doc.line(margin, currentY, margin + tableWidth, currentY);
          doc.setLineWidth(0.2);
        }
        
        // Couleur de fond alternée
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          // Remplir seulement les colonnes non fusionnées
          xPos = margin + colWidths[0];
          doc.rect(xPos, currentY, colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], rowHeight, 'F');
        }
        
        // Dessiner les bordures horizontales
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        // Bordure supérieure (sauf si c'est la première ligne du groupe avec séparation foncée)
        if (!(groupIndex > 0 && rowInGroup === 0)) {
          doc.line(margin, currentY, margin + tableWidth, currentY);
        }
        // Bordure inférieure
        doc.line(margin, currentY + rowHeight, margin + tableWidth, currentY + rowHeight);
        
        // Dessiner les bordures verticales (seulement pour les colonnes non fusionnées)
        xPos = margin;
        // Après Groupe - ne pas dessiner pour les lignes intermédiaires du groupe
        if (rowInGroup === 0 || rowInGroup === groupRowCount - 1) {
          xPos = margin + colWidths[0];
          doc.line(xPos, currentY, xPos, currentY + rowHeight);
        }
        // Après Matricule
        xPos = margin + colWidths[0] + colWidths[1];
        doc.line(xPos, currentY, xPos, currentY + rowHeight);
        // Après Nom
        xPos += colWidths[2];
        doc.line(xPos, currentY, xPos, currentY + rowHeight);
        // Après Filière
        xPos += colWidths[3];
        doc.line(xPos, currentY, xPos, currentY + rowHeight);
        // Après Niveau Étudiant - ne pas dessiner pour les lignes intermédiaires du groupe
        xPos += colWidths[4];
        if (rowInGroup === 0 || rowInGroup === groupRowCount - 1) {
          doc.line(xPos, currentY, xPos, currentY + rowHeight);
        }
        
        // Dessiner les cellules avec texte
        xPos = margin;
        const cellData = [
          group.groupe.toString(), // Utiliser le groupe du group, pas de la row
          row.matricule || '-',
          row.nom || '-',
          row.filiere || '-',
          row.niveauEtudiant || '-',
          group.sujet || '-' // Utiliser le sujet du group, pas de la row
        ];
        
        cellData.forEach((cell, cellIndex) => {
          const align = headerAligns[cellIndex];
          
          if (cellIndex === 0 || cellIndex === 5) {
            // Colonnes fusionnées - afficher seulement sur la première ligne du groupe
            if (rowInGroup === 0) {
              const textX = align === 'center' ? xPos + colWidths[cellIndex] / 2 : xPos + 2;
              const textY = currentY + groupHeight / 2 + 2;
              doc.text(cell, textX, textY, { align, maxWidth: colWidths[cellIndex] - 4 });
              
              // Dessiner le rectangle de fusion avec bordures complètes
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.2);
              // Bordures verticales complètes pour la cellule fusionnée
              doc.line(xPos, currentY, xPos, currentY + groupHeight);
              doc.line(xPos + colWidths[cellIndex], currentY, xPos + colWidths[cellIndex], currentY + groupHeight);
              // Bordures horizontales (seulement si pas de ligne de séparation foncée)
              if (!(groupIndex > 0 && rowInGroup === 0)) {
                doc.line(xPos, currentY, xPos + colWidths[cellIndex], currentY);
              }
              doc.line(xPos, currentY + groupHeight, xPos + colWidths[cellIndex], currentY + groupHeight);
            }
          } else {
            // Colonnes normales - toujours afficher
            const textX = align === 'center' ? xPos + colWidths[cellIndex] / 2 : xPos + 2;
            doc.text(cell, textX, currentY + rowHeight / 2 + 2, { align, maxWidth: colWidths[cellIndex] - 4 });
          }
          xPos += colWidths[cellIndex];
        });
        
        currentY += rowHeight;
        rowIndex++;
      });
      
      // Ligne de séparation foncée après le dernier groupe (sauf le tout dernier)
      if (groupIndex < groupedData.length - 1) {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, margin + tableWidth, currentY);
        doc.setLineWidth(0.2);
      }
    });
    
    // Sauvegarder le PDF
    const safeTitle = (projet.titre || 'projet').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeTitle}_groupes_${new Date().toISOString().split('T')[0]}.pdf`);
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
        style={{ width: `calc(100vw - ${SIDEBAR_WIDTH_PX}px)` }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{projet?.titre || 'Détails du projet'}</h2>
            {projet?.description && (
              <p className="text-slate-600 mt-1">{projet.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informations générales */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Informations générales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Nombre d'étudiants par groupe</Label>
                <p className="font-semibold text-lg">{projet?.nb_par_groupe || 0}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Nombre de groupes</Label>
                <p className="font-semibold text-lg">{projet?.groupes?.length || 0}</p>
              </div>
              {projet?.niveaux && projet.niveaux.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">Niveaux concernés</Label>
                  <p className="font-semibold">{projet.niveaux.join(', ')}</p>
                </div>
              )}
              {projet?.date_debut && projet?.date_fin && (
                <div className="space-y-1">
                  <Label className="text-sm text-gray-600">Période</Label>
                  <p className="font-semibold text-sm">
                    {new Date(projet.date_debut).toLocaleDateString('fr-FR')} - {new Date(projet.date_fin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Liste des sujets */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Sujets ({projet?.sujets?.length || 0})
              </h3>
              {sujetsModified && (
                <Button
                  onClick={handleRepartirAfterModification}
                  disabled={repartirLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {repartirLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Répartition...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Répartir les étudiants
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Formulaire d'ajout de sujet */}
            <Card className="p-4 border-2 border-dashed border-blue-300 bg-blue-50/30">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold text-slate-900">Ajouter un nouveau sujet</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_titre_sujet">Titre du sujet *</Label>
                  <Input
                    id="new_titre_sujet"
                    placeholder="Ex: Application mobile de gestion"
                    value={newSujetData.titre_sujet}
                    onChange={(e) => setNewSujetData({ ...newSujetData, titre_sujet: e.target.value })}
                    disabled={addingSujet}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_description_sujet">Description (optionnel)</Label>
                  <Textarea
                    id="new_description_sujet"
                    placeholder="Description du sujet..."
                    value={newSujetData.description}
                    onChange={(e) => setNewSujetData({ ...newSujetData, description: e.target.value })}
                    rows={3}
                    disabled={addingSujet}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddSujet}
                    disabled={addingSujet || !newSujetData.titre_sujet?.trim()}
                    className="gap-2"
                  >
                    {addingSujet ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Liste des sujets existants */}
            {projet?.sujets && projet.sujets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projet.sujets.map((sujet) => (
                  <Card key={sujet.id} className="p-4 hover:shadow-md transition-shadow">
                    {editingSujetId === sujet.id ? (
                      // Mode édition
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`edit_titre_${sujet.id}`}>Titre du sujet *</Label>
                          <Input
                            id={`edit_titre_${sujet.id}`}
                            placeholder="Titre du sujet"
                            value={editingSujetData.titre_sujet}
                            onChange={(e) => setEditingSujetData({ ...editingSujetData, titre_sujet: e.target.value })}
                            disabled={updatingSujet}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit_description_${sujet.id}`}>Description</Label>
                          <Textarea
                            id={`edit_description_${sujet.id}`}
                            placeholder="Description du sujet (optionnel)"
                            value={editingSujetData.description}
                            onChange={(e) => setEditingSujetData({ ...editingSujetData, description: e.target.value })}
                            rows={3}
                            disabled={updatingSujet}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditSujet}
                            disabled={updatingSujet}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveSujet(sujet.id)}
                            disabled={updatingSujet || !editingSujetData.titre_sujet?.trim()}
                          >
                            {updatingSujet ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Confirmer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <h4 className="font-semibold text-base">{sujet.titre_sujet}</h4>
                            {sujet.description && (
                              <p className="text-sm text-gray-600 line-clamp-3">{sujet.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          {onEditSujet && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditSujet(sujet);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSujetClick(sujet);
                            }}
                            disabled={deletingSujetId === sujet.id}
                          >
                            {deletingSujetId === sujet.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Tableau des groupes style Google Sheets */}
          {projet?.groupes && projet.groupes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Groupes ({projet.groupes.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exporter CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exporter PDF
                  </Button>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm" ref={tableRef}>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="min-w-full border-collapse bg-white">
                    <thead className="sticky top-0 z-10 bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th className="font-semibold text-gray-800 bg-gray-100 border-r border-gray-300 px-4 py-3 text-sm text-center min-w-[80px] sticky left-0 z-20 bg-gray-100 shadow-[2px_0_2px_-1px_rgba(0,0,0,0.1)]">
                          Groupe
                        </th>
                        <th className="font-semibold text-gray-800 bg-gray-100 border-r border-gray-300 px-4 py-3 text-sm text-left min-w-[120px]">
                          Matricule
                        </th>
                        <th className="font-semibold text-gray-800 bg-gray-100 border-r border-gray-300 px-4 py-3 text-sm text-left min-w-[150px]">
                          Nom
                        </th>
                        <th className="font-semibold text-gray-800 bg-gray-100 border-r border-gray-300 px-4 py-3 text-sm text-left min-w-[120px]">
                          Filière
                        </th>
                        <th className="font-semibold text-gray-800 bg-gray-100 border-r border-gray-300 px-4 py-3 text-sm text-left min-w-[100px]">
                          Niveau Étudiant
                        </th>
                        <th className="font-semibold text-gray-800 bg-gray-100 px-4 py-3 text-sm text-center min-w-[200px]">
                          Sujet
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {tableData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            Aucune donnée disponible
                          </td>
                        </tr>
                      ) : (
                        tableData.map((row, index) => {
                          const isFirstInGroup = row.isFirstInGroup && index > 0;
                          const isGroupStart = index === 0 || (tableData[index - 1]?.groupeId !== row.groupeId);
                          const showGroupeCell = row.rowSpan > 0;
                          const showSujetCell = row.rowSpan > 0;
                          
                          return (
                            <tr
                              key={`${row.groupeId}-${index}`}
                              className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                                isFirstInGroup ? 'border-t-2 border-gray-400' : ''
                              } ${isGroupStart ? 'bg-gray-50/50' : ''}`}
                            >
                              {showGroupeCell && (
                                <td 
                                  rowSpan={row.rowSpan}
                                  className="border-r border-gray-200 px-4 py-2.5 text-sm font-medium bg-gray-50/80 sticky left-0 z-10 shadow-[2px_0_2px_-1px_rgba(0,0,0,0.1)] text-center align-middle"
                                >
                                  {row.groupe}
                                </td>
                              )}
                              <td className="border-r border-gray-200 px-4 py-2.5 text-sm font-mono text-gray-700">
                                {row.matricule || '-'}
                              </td>
                              <td className="border-r border-gray-200 px-4 py-2.5 text-sm">
                                {row.nom || '-'}
                              </td>
                              <td className="border-r border-gray-200 px-4 py-2.5 text-sm">
                                {row.filiere || '-'}
                              </td>
                              <td className="border-r border-gray-200 px-4 py-2.5 text-sm">
                                {row.niveauEtudiant || '-'}
                              </td>
                              {showSujetCell && (
                                <td 
                                  rowSpan={row.rowSpan}
                                  className="px-4 py-2.5 text-sm text-center align-middle"
                                >
                                  {row.sujet || '-'}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {(!projet?.groupes || projet.groupes.length === 0) && (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Aucun groupe créé pour le moment</p>
              {projet?.sujets && projet.sujets.length > 0 && (
                <Button
                  className="mt-4 gap-2"
                  onClick={() => {
                    onClose();
                    onRepartir?.(projet.id);
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>

      {/* Modal de confirmation de suppression de sujet */}
      <Dialog 
        open={deleteSujetDialogOpen} 
        onOpenChange={(open) => {
          setDeleteSujetDialogOpen(open);
          if (!open) {
            setSujetToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] z-[60]">
          <DialogHeader>
            <DialogTitle>Supprimer le sujet</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le sujet <strong>{sujetToDelete?.titre_sujet}</strong> ?
              <br />
              <br />
              Cette action est irréversible. Les groupes associés à ce sujet seront également affectés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteSujetDialogOpen(false);
                setSujetToDelete(null);
              }}
              disabled={deletingSujetId === sujetToDelete?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteSujet}
              disabled={deletingSujetId === sujetToDelete?.id}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingSujetId === sujetToDelete?.id ? (
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
}

