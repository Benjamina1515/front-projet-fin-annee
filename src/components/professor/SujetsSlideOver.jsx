import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
import { X, Plus, BookOpen } from 'lucide-react';

const SIDEBAR_WIDTH_PX = 256;

export default function SujetsSlideOver({ open, projetId, projetTitre, onClose, onSubmit, submitting }) {
  const [sujets, setSujets] = useState([{ titre_sujet: '', description: '' }]);

  useEffect(() => {
    if (!open) {
      // Réinitialiser le formulaire quand on ferme
      setSujets([{ titre_sujet: '', description: '' }]);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider qu'au moins un sujet a un titre
    const validSujets = sujets.filter(s => s.titre_sujet.trim() !== '');
    if (validSujets.length === 0) {
      return;
    }
    
    onSubmit?.(validSujets);
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
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ajouter des sujets</h3>
            {projetTitre && (
              <p className="text-sm text-slate-600 mt-1">Projet: {projetTitre}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator />

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-6">
          {/* Section Sujets */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Sujets (sous-projets)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSujet}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un sujet
              </Button>
            </div>
            
            <div className="space-y-4">
              {sujets.map((sujet, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-3">
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
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`titre_sujet_${index}`}>Titre du sujet *</Label>
                      <Input
                        id={`titre_sujet_${index}`}
                        placeholder="Ex: Application mobile"
                        value={sujet.titre_sujet}
                        onChange={(e) => handleSujetChange(index, 'titre_sujet', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description_sujet_${index}`}>Description</Label>
                      <Textarea
                        id={`description_sujet_${index}`}
                        placeholder="Description du sujet (optionnel)"
                        value={sujet.description}
                        onChange={(e) => handleSujetChange(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {sujets.filter(s => s.titre_sujet.trim() !== '').length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Veuillez ajouter au moins un sujet avec un titre
              </p>
            )}
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
            disabled={submitting || sujets.filter(s => s.titre_sujet.trim() !== '').length === 0}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer les sujets'}
          </Button>
        </div>
      </div>
    </div>
  );
}


