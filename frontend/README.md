# AX5-SECT Frontend

Interface Control Tower pour le système AgenticX5 Supplier Engagement Control Tower.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvrir http://localhost:3000

### Backend requis

Le backend AX5-SECT doit être lancé sur le port 8000 :

```bash
# Dans le dossier backend
python main.py api --reload
```

## 📁 Structure

```
frontend/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Dashboard
│   ├── chat/              # Interface Chat IA
│   ├── suppliers/         # Gestion fournisseurs
│   └── campaigns/         # Gestion campagnes
├── components/
│   ├── layout/            # Sidebar, Header
│   ├── dashboard/         # KPI cards, charts
│   └── ui/                # Composants réutilisables
├── lib/
│   ├── api.ts             # Client API
│   └── utils.ts           # Utilitaires
└── public/                # Assets statiques
```

## 🎨 Technologies

- **Next.js 14** - Framework React
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **Lucide React** - Icônes
- **TypeScript** - Typage

## 📊 Pages

| Page | Description |
|------|-------------|
| `/` | Dashboard avec KPIs et vue d'ensemble |
| `/chat` | Interface conversationnelle avec les agents IA |
| `/suppliers` | Liste et gestion des fournisseurs |
| `/campaigns` | Campagnes d'engagement (IMDS, PCF) |

## 🔌 API

Le frontend communique avec le backend via les endpoints :

- `POST /chat` - Chat avec les agents IA
- `GET /suppliers` - Liste des fournisseurs
- `GET /campaigns` - Liste des campagnes
- `GET /health` - Health check

## 🎯 Fonctionnalités

- ✅ Dashboard avec KPIs en temps réel
- ✅ Chat interactif avec 5 agents IA
- ✅ Gestion des fournisseurs
- ✅ Suivi des campagnes IMDS/PCF
- ✅ Interface responsive
- ✅ Mode démonstration

## 📝 Configuration

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚢 Déploiement

```bash
# Build de production
npm run build

# Démarrer en production
npm start
```

Compatible avec Vercel, Netlify, ou tout hébergeur Node.js.
