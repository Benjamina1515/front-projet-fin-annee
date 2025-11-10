import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_ROUTES } from '../utils/constants';
import { toast } from 'react-toastify';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select-new';

const initialFormState = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    matricule: '',
    filiere: '',
    niveau: '',
    specialite: '',
    grade: '',
};

const Register = () => {
    const [formValues, setFormValues] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleChange = (value) => {
        setFormValues((prev) => ({
            ...prev,
            role: value,
            filiere: value === 'etudiant' ? prev.filiere : '',
            niveau: value === 'etudiant' ? prev.niveau : '',
            specialite: value === 'prof' ? prev.specialite : '',
            grade: value === 'prof' ? prev.grade : '',
        }));
    };

    // Avatar removed per request

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!formValues.role) {
            const message = 'Veuillez sélectionner un rôle';
            setError(message);
            toast.error(message);
            return;
        }
        if (formValues.role === 'etudiant' && !formValues.niveau) {
            const message = 'Veuillez sélectionner le niveau';
            setError(message);
            toast.error(message);
            return;
        }
        setLoading(true);

        try {
            const payload = new FormData();
            payload.append('name', formValues.name.trim());
            payload.append('email', formValues.email.trim());
            payload.append('password', formValues.password);
            payload.append('password_confirmation', formValues.password_confirmation);
            payload.append('role', formValues.role);
            payload.append('matricule', formValues.matricule.trim());

            if (formValues.role === 'etudiant') {
                payload.append('filiere', formValues.filiere.trim());
                payload.append('niveau', formValues.niveau.trim());
            } else if (formValues.role === 'prof') {
                payload.append('specialite', formValues.specialite.trim());
                payload.append('grade', formValues.grade.trim());
            }

            // Avatar upload removed

            const result = await register(payload);

            if (result.success) {
                toast.success('Inscription réussie');
                const redirectPath = ROLE_ROUTES[formValues.role] || '/';
                navigate(redirectPath, { replace: true });
            } else {
                const message = result.error || "Erreur lors de l'inscription";
                setError(message);
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const isStudent = formValues.role === 'etudiant';
    const isProfessor = formValues.role === 'prof';
    const hasPickedRole = !!formValues.role;

    // Validation dynamique du formulaire
    const emailTrimmed = formValues.email.trim();
    const isEmailValid = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(emailTrimmed);
    const isPasswordValid = formValues.password.length >= 6; // backend min:6
    const passwordsMatch = formValues.password && formValues.password === formValues.password_confirmation;
    const roleFieldsValid = hasPickedRole && formValues.name.trim() && formValues.matricule.trim();
    const studentFieldsValid = !isStudent || (formValues.filiere.trim() && formValues.niveau.trim());
    const professorFieldsValid = !isProfessor || (formValues.specialite.trim() && formValues.grade.trim());
    const isFormValid = isEmailValid && isPasswordValid && passwordsMatch && roleFieldsValid && studentFieldsValid && professorFieldsValid;

    return (
        <div className="min-h-screen max-w-full flex items-center justify-center bg-linear-to-br from-purple-50 via-slate-50 to-blue-100">
            <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="grid md:grid-cols-2 h-screen px-4 py-7 ">
                    <div className="hidden md:flex flex-col justify-center bg-linear-to-br rounded-l-xl from-blue-600 to-indigo-600 text-white p-8 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">Créer un compte</h1>
                            <p className="text-blue-100 mt-3">
                                Rejoignez la plateforme pour suivre vos projets et vos tâches académiques en toute simplicité.
                            </p>
                        </div>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li>• Accédez à votre tableau de bord personnalisé</li>
                            <li>• Collaborez avec votre équipe et vos enseignants</li>
                            <li>• Suivez vos tâches et échéances en temps réel</li>
                        </ul>
                    </div>

                    <div className="p-8 md:p-10">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Creer un compte</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div className=" grid md:grid-cols-2 gap-4">
                                <div className='md:col-span-2'>
                                    <p className="block text-sm font-medium text-gray-700 mb-2">
                                        Choisissez un rôle pour personnaliser l'accès
                                    </p>
                                    <RadioGroup
                                        value={formValues.role}
                                        onValueChange={handleRoleChange}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                    >
                                        <RadioGroupItem id="role-etudiant" value="etudiant">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Étudiant</p>
                                                    <p className="text-xs text-gray-500">Suivi de projets et tâches</p>
                                                </div>
                                            </div>
                                        </RadioGroupItem>
                                        <RadioGroupItem id="role-prof" value="prof">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Professeur</p>
                                                    <p className="text-xs text-gray-500">Gestion des étudiants et évaluations</p>
                                                </div>
                                            </div>
                                        </RadioGroupItem>
                                    </RadioGroup>
                                </div>
                                {hasPickedRole && (
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formValues.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Jean Dupont"
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formValues.email}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-2 rounded-lg focus:ring-2 ${emailTrimmed && !isEmailValid ? 'border-red-400 focus:ring-red-500 focus:border-red-500 border' : 'border border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                                        placeholder="votre@email.com"
                                    />
                                    {emailTrimmed && !isEmailValid && (
                                        <p className="mt-1 text-xs text-red-600">Email invalide. Exemple: nom@domaine.com</p>
                                    )}
                                </div>

                                {/* Hide the rest of form until role chosen */}
                                {!hasPickedRole && (
                                    <div className="md:col-span-2">
                                        <div className="mt-2 rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                            Sélectionnez un rôle pour continuer l'inscription.
                                        </div>
                                    </div>
                                )}

                                {hasPickedRole && (
                                    <div>
                                        <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                                            Matricule
                                        </label>
                                        <input
                                            id="matricule"
                                            name="matricule"
                                            type="text"
                                            value={formValues.matricule}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="EX: MAT123456"
                                        />
                                    </div>
                                )}

                                {hasPickedRole && isStudent && (
                                    <>
                                        <div>
                                            <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-2">
                                                Filière
                                            </label>
                                            <input
                                                id="filiere"
                                                name="filiere"
                                                type="text"
                                                value={formValues.filiere}
                                                onChange={handleInputChange}
                                                required={isStudent}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Informatique"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-2">
                                                Niveau
                                            </label>
                                            <Select
                                                value={formValues.niveau}
                                                onValueChange={(value) => setFormValues((prev) => ({ ...prev, niveau: value }))}
                                            >
                                                <SelectTrigger id="niveau">
                                                    <SelectValue placeholder="Sélectionnez un niveau" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    <SelectItem value="L1">L1</SelectItem>
                                                    <SelectItem value="L2">L2</SelectItem>
                                                    <SelectItem value="L3">L3</SelectItem>
                                                    <SelectItem value="M1">M1</SelectItem>
                                                    <SelectItem value="M2">M2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {hasPickedRole && isProfessor && (
                                    <>
                                        <div>
                                            <label htmlFor="specialite" className="block text-sm font-medium text-gray-700 mb-2">
                                                Spécialité
                                            </label>
                                            <input
                                                id="specialite"
                                                name="specialite"
                                                type="text"
                                                value={formValues.specialite}
                                                onChange={handleInputChange}
                                                required={isProfessor}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Développement Web"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade
                                            </label>
                                            <input
                                                id="grade"
                                                name="grade"
                                                type="text"
                                                value={formValues.grade}
                                                onChange={handleInputChange}
                                                required={isProfessor}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Maître assistant"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Avatar field removed */}

                                <div className="md:col-span-2">
                                    <div className="flex gap-4">
                                        <div className="flex-1 min-w-0">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Mot de passe
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formValues.password}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirmer le mot de passe
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={formValues.password_confirmation}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="••••••••"
                                            />
                                            {formValues.password_confirmation && !passwordsMatch && (
                                                <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Création du compte...' : "S'inscrire"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
