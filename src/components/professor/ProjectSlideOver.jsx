import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { X } from 'lucide-react';

const SIDEBAR_WIDTH_PX = 256;

const NIVEAUX = [
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'M1', label: 'M1' },
  { value: 'M2', label: 'M2' },
];

export default function ProjectSlideOver({ open, onClose, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    nb_par_groupe: 3,
    niveaux: [], // Sera un tableau avec un seul élément
    date_debut: '',
    date_fin: '',
  });

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
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
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
          <h3 className="text-lg font-semibold text-slate-900">Nouveau projet</h3>
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
            <h3 className="text-sm font-semibold text-slate-700">Période</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de début *</Label>
                <Input
                  id="date_debut"
                  name="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin *</Label>
                <Input
                  id="date_fin"
                  name="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={handleChange}
                  min={formData.date_debut}
                  required
                />
                {formData.date_debut && formData.date_fin && new Date(formData.date_fin) < new Date(formData.date_debut) && (
                  <p className="text-xs text-red-500 mt-1">La date de fin doit être postérieure à la date de début</p>
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
            {submitting ? 'En cours...' : 'Créer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

