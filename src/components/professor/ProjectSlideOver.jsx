import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Select } from '../ui/select';
import { X, Calendar, Clock } from 'lucide-react';

const SIDEBAR_WIDTH_PX = 256;

const NIVEAUX = [
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'M1', label: 'M1' },
  { value: 'M2', label: 'M2' },
];

const PERIODE_OPTIONS = [
  { value: '1mois', label: '1 mois' },
  { value: '2mois', label: '2 mois' },
  { value: '3mois', label: '3 mois' },
  { value: 'personnalise', label: 'Personnalisé' },
];

export default function ProjectSlideOver({ open, mode = 'create', initialProject, onClose, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    nb_par_groupe: 3,
    niveaux: [], // Sera un tableau avec un seul élément
    date_debut: '',
    date_fin: '',
  });
  
  const [periodeMode, setPeriodeMode] = useState('1mois'); // '1mois', '2mois', '3mois', 'personnalise'

  useEffect(() => {
    if (!open) {
      // Réinitialiser le formulaire quand on ferme
      setFormData({
        titre: '',
        description: '',
        nb_par_groupe: 3,
        niveaux: [],
        date_debut: '',
        date_fin: '',
      });
      setPeriodeMode('1mois');
    } else if (mode === 'edit' && initialProject) {
      // Remplir le formulaire avec les données du projet existant
      const niveaux = initialProject.niveaux && initialProject.niveaux.length > 0 
        ? initialProject.niveaux 
        : [];
      
      // Déterminer le mode de période basé sur les dates
      let detectedMode = 'personnalise';
      if (initialProject.date_debut && initialProject.date_fin) {
        const dateDebut = new Date(initialProject.date_debut);
        const dateFin = new Date(initialProject.date_fin);
        const diffMonths = (dateFin.getFullYear() - dateDebut.getFullYear()) * 12 + 
                          (dateFin.getMonth() - dateDebut.getMonth());
        
        if (diffMonths === 1) detectedMode = '1mois';
        else if (diffMonths === 2) detectedMode = '2mois';
        else if (diffMonths === 3) detectedMode = '3mois';
        else detectedMode = 'personnalise';
      }
      
      setFormData({
        titre: initialProject.titre || '',
        description: initialProject.description || '',
        nb_par_groupe: initialProject.nb_par_groupe || 3,
        niveaux: niveaux,
        date_debut: initialProject.date_debut || '',
        date_fin: initialProject.date_fin || '',
      });
      setPeriodeMode(detectedMode);
    }
  }, [open, mode, initialProject]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handlePeriodeModeChange = (mode) => {
    setPeriodeMode(mode);
    
    if (mode !== 'personnalise') {
      // En mode automatique, définir la date de début à aujourd'hui
      const aujourdhui = new Date();
      const dateDebut = aujourdhui.toISOString().split('T')[0];
      const dateFin = new Date(aujourdhui);
      
      switch (mode) {
        case '1mois':
          dateFin.setMonth(dateFin.getMonth() + 1);
          break;
        case '2mois':
          dateFin.setMonth(dateFin.getMonth() + 2);
          break;
        case '3mois':
          dateFin.setMonth(dateFin.getMonth() + 3);
          break;
        default:
          return;
      }
      
      setFormData((f) => ({
        ...f,
        date_debut: dateDebut,
        date_fin: dateFin.toISOString().split('T')[0],
      }));
    } else {
      // En mode personnalisé, réinitialiser les dates si elles étaient automatiques
      if (formData.date_debut && formData.date_fin) {
        // Garder les dates existantes ou les réinitialiser
        setFormData((f) => ({
          ...f,
          date_debut: f.date_debut || '',
          date_fin: f.date_fin || '',
        }));
      }
    }
  };

  const handleDateDebutChange = (e) => {
    const dateDebut = e.target.value;
    
    // Si le mode n'est pas personnalisé, calculer automatiquement la date de fin
    if (periodeMode !== 'personnalise' && dateDebut) {
      const dateDebutObj = new Date(dateDebut);
      const dateFinObj = new Date(dateDebutObj);
      
      switch (periodeMode) {
        case '1mois':
          dateFinObj.setMonth(dateFinObj.getMonth() + 1);
          break;
        case '2mois':
          dateFinObj.setMonth(dateFinObj.getMonth() + 2);
          break;
        case '3mois':
          dateFinObj.setMonth(dateFinObj.getMonth() + 3);
          break;
        default:
          break;
      }
      
      setFormData((f) => ({
        ...f,
        date_debut: dateDebut,
        date_fin: dateFinObj.toISOString().split('T')[0],
      }));
    } else {
      setFormData((f) => ({ ...f, date_debut: dateDebut }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date_debut') {
      handleDateDebutChange(e);
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const handleNiveauSelect = (niveau) => {
    // Sélection unique : remplacer le tableau par un seul élément
    setFormData((f) => ({
      ...f,
      niveaux: [niveau], // Un seul niveau sélectionné
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.niveaux.length === 0) {
      return;
    }
    
    if (!formData.date_debut || !formData.date_fin) {
      return;
    }
    
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      return;
    }
    
    onSubmit?.(formData);
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
        style={{ width: `calc((100vw - ${SIDEBAR_WIDTH_PX}px) / 2)` }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {mode === 'edit' ? 'Modifier le projet' : 'Nouveau projet'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator />

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-6">
          {/* Informations générales */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Informations générales</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du projet *</Label>
                <Input
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Projet de fin d'année - Informatique"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description du projet (optionnel)"
                  rows={4}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Configuration */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nb_par_groupe">Nombre d'étudiants par groupe *</Label>
                <Input
                  id="nb_par_groupe"
                  name="nb_par_groupe"
                  type="number"
                  min="1"
                  value={formData.nb_par_groupe}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Niveau concerné *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {NIVEAUX.map((niveau) => (
                    <button
                      key={niveau.value}
                      type="button"
                      onClick={() => handleNiveauSelect(niveau.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.niveaux.includes(niveau.value)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {niveau.label}
                    </button>
                  ))}
                </div>
                {formData.niveaux.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Veuillez sélectionner un niveau</p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Dates */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Période
            </h3>
            <div className="space-y-4">
              {/* Sélection du mode de période */}
              <div className="space-y-2">
                <Label>Durée du projet *</Label>
                <Select
                  value={periodeMode}
                  onChange={handlePeriodeModeChange}
                  options={PERIODE_OPTIONS}
                  placeholder="Sélectionner une durée"
                />
              </div>
              
              {/* Champs de dates avec style amélioré */}
              <div className="space-y-3">
                {/* Afficher les champs de date uniquement en mode personnalisé */}
                {periodeMode === 'personnalise' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_debut" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Date de début *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                        <Input
                          id="date_debut"
                          name="date_debut"
                          type="date"
                          value={formData.date_debut}
                          onChange={handleChange}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_fin" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Date de fin *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                        <Input
                          id="date_fin"
                          name="date_fin"
                          type="date"
                          value={formData.date_fin}
                          onChange={handleChange}
                          min={formData.date_debut}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {periodeMode === 'personnalise' && formData.date_debut && formData.date_fin && new Date(formData.date_fin) < new Date(formData.date_debut) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    La date de fin doit être postérieure à la date de début
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>

        <Separator />
        <div className="p-3 px-4 bg-white flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit} 
            disabled={submitting || formData.niveaux.length === 0 || !formData.date_debut || !formData.date_fin || (formData.date_debut && formData.date_fin && new Date(formData.date_fin) < new Date(formData.date_debut))}
          >
            {submitting ? 'En cours...' : (mode === 'edit' ? 'Enregistrer' : 'Créer')}
          </Button>
        </div>
      </div>
    </div>
  );
}

