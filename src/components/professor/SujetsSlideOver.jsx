import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { X, Plus, BookOpen, Loader2, AlertCircle } from 'lucide-react';

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

  const validSujetsCount = sujets.filter(s => s.titre_sujet.trim() !== '').length;
  const hasEmptySujets = sujets.some(s => s.titre_sujet.trim() === '' && s.description.trim() !== '');

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      {/* Overlay qui couvre toute la page sauf la sidebar */}
      <div
        className={`absolute transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0'} bg-slate-900/50 backdrop-blur-sm`}
        style={{
          left: `${SIDEBAR_WIDTH_PX}px`,
          top: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
      />

      {/* Modal plein écran sauf sidebar */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`absolute bg-white flex flex-col will-change-transform transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          left: `${SIDEBAR_WIDTH_PX}px`,
          top: 0,
          right: 0,
          bottom: 0,
          width: `calc(100vw - ${SIDEBAR_WIDTH_PX}px)`,
          height: '100vh',
        }}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Créer des sujets</h2>
                {projetTitre && (
                  <p className="text-slate-600 mt-1 text-sm">
                    Pour le projet: <span className="font-semibold text-blue-700">{projetTitre}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
                <div className={`w-2 h-2 rounded-full ${validSujetsCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-slate-700">
                  {validSujetsCount > 0 
                    ? `${validSujetsCount} sujet${validSujetsCount > 1 ? 's' : ''} ${validSujetsCount === sujets.length ? 'complet' : 'en cours'}`
                    : 'Aucun sujet créé'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
                <span className="text-sm text-slate-600">Total: {sujets.length}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer" className="hover:bg-white/80">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 h-full">
          <div className="max-w-7xl mx-auto px-8 py-8 min-h-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Instructions et Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Guide de création</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Les sujets sont les sous-projets que les étudiants pourront choisir lors de la répartition. 
                          <br />
                          <span className="font-medium text-slate-700">Chaque sujet doit avoir un titre</span> (obligatoire) et peut avoir une description (optionnelle mais recommandée).
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddSujet}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    Ajouter un sujet
                  </Button>
                </div>
              </div>

              {/* Alert si sujet incomplet */}
              {hasEmptySujets && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Attention : Sujets incomplets</p>
                    <p className="text-sm text-yellow-700">
                      Certains sujets ont une description mais pas de titre. Veuillez compléter le titre pour que le sujet soit enregistré.
                    </p>
                  </div>
                </div>
              )}

              {/* Section Sujets */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-semibold">
                      {sujets.length}
                    </div>
                    <span>Sujets créés</span>
                  </h3>
                </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sujets.map((sujet, index) => (
                  <Card key={index} className={`p-6 hover:shadow-lg transition-all duration-200 border-2 ${
                    sujet.titre_sujet.trim() 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-base ${
                          sujet.titre_sujet.trim()
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <Label className="text-lg font-bold text-slate-900">Sujet {index + 1}</Label>
                          {sujet.titre_sujet.trim() && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                Complet
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {sujets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSujet(index)}
                          className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          aria-label={`Supprimer le sujet ${index + 1}`}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor={`titre_sujet_${index}`} className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                          Titre du sujet 
                          <span className="text-red-500 text-base">*</span>
                        </Label>
                        <Input
                          id={`titre_sujet_${index}`}
                          placeholder="Ex: Application mobile de gestion de bibliothèque"
                          value={sujet.titre_sujet}
                          onChange={(e) => handleSujetChange(index, 'titre_sujet', e.target.value)}
                          required
                          className={`w-full h-11 text-base ${
                            sujet.titre_sujet.trim() 
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                              : ''
                          }`}
                        />
                        {!sujet.titre_sujet.trim() && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Le titre est obligatoire pour enregistrer ce sujet
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description_sujet_${index}`} className="text-sm font-semibold text-slate-700">
                          Description 
                          <span className="text-slate-400 text-xs font-normal ml-1">(optionnel mais recommandé)</span>
                        </Label>
                        <Textarea
                          id={`description_sujet_${index}`}
                          placeholder="Décrivez brièvement le sujet, ses objectifs, les technologies à utiliser, etc..."
                          value={sujet.description}
                          onChange={(e) => handleSujetChange(index, 'description', e.target.value)}
                          rows={5}
                          className="w-full resize-none text-base"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">
                            {sujet.description.length} caractère{sujet.description.length > 1 ? 's' : ''}
                          </p>
                          {sujet.description.length > 0 && (
                            <p className="text-xs text-blue-600 font-medium">
                              ✓ Description ajoutée
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {validSujetsCount === 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-red-800 mb-1">Aucun sujet valide</p>
                    <p className="text-sm text-red-700">
                      Veuillez ajouter au moins un sujet avec un titre pour pouvoir enregistrer. Les sujets sans titre ne seront pas sauvegardés.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center sticky bottom-0 shadow-lg">
          <div className="flex items-center gap-4">
            {validSujetsCount > 0 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">
                  {validSujetsCount} sujet{validSujetsCount > 1 ? 's' : ''} prêt{validSujetsCount > 1 ? 's' : ''} à être enregistré{validSujetsCount > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Ajoutez au moins un sujet avec un titre</span>
              </div>
            )}
            {sujets.length > validSujetsCount && (
              <div className="text-xs text-slate-500">
                ({sujets.length - validSujetsCount} sujet{sujets.length - validSujetsCount > 1 ? 's' : ''} incomplet{sujets.length - validSujetsCount > 1 ? 's' : ''})
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={submitting}
              size="lg"
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || validSujetsCount === 0}
              className="min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Enregistrer {validSujetsCount > 0 ? `${validSujetsCount} sujet${validSujetsCount > 1 ? 's' : ''}` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



