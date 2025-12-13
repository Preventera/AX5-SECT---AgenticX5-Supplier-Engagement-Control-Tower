# 🔐 Configuration de l'authentification Clerk pour AX5-SECT

## Étape 1 : Créer un compte Clerk

1. Va sur **https://dashboard.clerk.com**
2. Crée un compte gratuit
3. Crée une nouvelle application "AX5-SECT"

## Étape 2 : Configurer l'application

Dans le dashboard Clerk :

1. **Application Settings** → Choisis les méthodes d'authentification :
   - ✅ Email
   - ✅ Google (optionnel)
   - ✅ Microsoft (optionnel)

2. **Customization** → **Branding** :
   - Couleur primaire : `#059669` (emerald-600)
   - Logo : Upload le logo X5

## Étape 3 : Récupérer les clés API

Dans **API Keys**, copie :
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (commence par `pk_`)
- `CLERK_SECRET_KEY` (commence par `sk_`)

## Étape 4 : Configurer les variables d'environnement

### En local

Crée un fichier `.env.local` dans `frontend/` :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Sur Vercel

1. Va sur **Vercel** → ton projet → **Settings** → **Environment Variables**
2. Ajoute les mêmes variables

## Étape 5 : Installer le package

```bash
cd frontend
npm install @clerk/nextjs @clerk/localizations
```

## Étape 6 : Tester

1. Lance l'app : `npm run dev`
2. Tu seras redirigé vers `/sign-in`
3. Connecte-toi avec ton email
4. Tu verras ton avatar dans le header !

## 🔒 Routes protégées

Toutes les routes sont protégées SAUF :
- `/sign-in` - Page de connexion
- `/sign-up` - Page d'inscription
- `/api/health` - Health check API

## 🎨 Personnalisation

Le thème Clerk est configuré pour correspondre à AX5-SECT :
- Boutons : emerald-600
- Style : Cards avec shadow

## 📱 Fonctionnalités incluses

- ✅ Connexion par email/mot de passe
- ✅ Connexion sociale (Google, Microsoft)
- ✅ Gestion du profil utilisateur
- ✅ Déconnexion
- ✅ Sessions sécurisées
- ✅ Interface en français

## ⚠️ Notes importantes

1. **Clerk est gratuit** jusqu'à 10,000 utilisateurs actifs mensuels
2. Les clés `pk_test_` sont pour le développement
3. En production, utilise les clés `pk_live_`

## 🔗 Liens utiles

- Documentation Clerk : https://clerk.com/docs
- Dashboard : https://dashboard.clerk.com
- Support : https://clerk.com/support
