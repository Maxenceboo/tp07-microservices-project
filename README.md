# **TP07 – Microservices Project**

Projet final du module DevOps / Microservices.
L’objectif est de construire une architecture complète composée de :

* **Frontend (Next.js)**
* **Auth Service (FastAPI + SQLite)**
* **Order Service (NestJS + SQLite)**
* **Dockerisation complète**
* **Orchestration Kubernetes (Minikube / Orbstack)**
* **Ingress + communication entre services**

Ce repo est organisé sous forme de **monorepo** pour faciliter le rendu, la compréhension du prof et la gestion des différentes briques.

## 🗂️ Structure du projet

```
/
├── frontend/              # Next.js + API Gateway
├── services/
│   ├── auth-service/      # FastAPI + JWT + SQLite
│   └── order-service/     # NestJS + SQLite
├── infra/
│   ├── docker/            # Dockerfiles + docker-compose.yml
│   └── k8s/               # Manifests Kubernetes (Deployments, Services, Ingress)
└── docs/                  # Notes, schémas, captures
```

## 🚀 Objectifs du projet

* Développer et containeriser plusieurs microservices
* Mettre en place une architecture modulaire
* Déployer l’ensemble dans un cluster Kubernetes
* Configurer l’exposition externe via un Ingress
* Assurer la communication entre tous les services

## 📦 Technologies

* **Next.js**
* **FastAPI**
* **NestJS**
* **SQLite**
* **Docker / Docker Compose**
* **Kubernetes (Minikube / Orbstack)**

## 🔧 Lancement (dev)

> Les commandes seront ajoutées au fur et à mesure
> en fonction de l’avancement des services.
