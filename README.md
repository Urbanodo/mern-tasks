# MERN Tasks ✅

Application de gestion des tâches avec la pile MERN (MongoDB, Express, React, Node.js).

## Fonctionnalités

- ✅ Inscription et connexion (JWT)
- ✅ Créer, modifier, supprimer des tâches
- ✅ Définir des échéances et priorités
- ✅ Suivre la progression (À faire / En cours / Terminé)
- ✅ Filtrer par statut et priorité
- ✅ Rechercher par titre ou description
- ✅ Trier par date, priorité ou titre

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express 4 |
| Base de données | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Déploiement | Vercel (frontend) + Render (backend) |

## Installation locale

### Backend
```bash
cd backend
copy .env.example .env   # Windows
# Remplir MONGODB_URI et JWT_SECRET
npm install
npm run dev              # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## API Endpoints

| Méthode | Route | Description |
|---|---|---|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/tasks | Lister les tâches |
| POST | /api/tasks | Créer une tâche |
| PUT | /api/tasks/:id | Modifier une tâche |
| DELETE | /api/tasks/:id | Supprimer une tâche |
