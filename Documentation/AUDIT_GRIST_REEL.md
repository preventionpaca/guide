# AUDIT GRIST RÉEL

## Objectif

Vérifier si un accès réel à la base Grist est disponible et documenter les tables existantes, les colonnes et les dépendances.

## Résumé de l'analyse

- Le dépôt utilise actuellement une architecture GitHub Pages avec un accès de secours via des Edge Functions Supabase (`read-app`, `auth-code`, `write-app`).
- Le code contient plusieurs références à la Grist API et à `docs.getgrist.com`, mais l'accès réel au document Grist n'est pas configuré de manière explicite dans le dépôt.
- Une URL Grist est mentionnée dans le code : `https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/119`.
- Cette URL retourne actuellement une erreur HTTP 404 lors de la vérification depuis l'environnement local.

## Accès Grist détecté dans le code

### Document Grist mentionné

- `https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/119`

### Indices d'accès Grist

- `grist-plugin-api.js` est chargé dans plusieurs pages.
- Le code détecte `window.grist` et utilise `window.grist.docApi.fetchTable(...)` quand la page est embarquée dans Grist.
- Plusieurs fichiers indiquent que le `docId` est résolu via `resolve-app` avec `app= "equipements"`.
- Le mode public GitHub utilise un fallback Supabase Edge Function (`read-app`) pour la lecture.

## Ce qui n'est pas configuré dans le dépôt

### Accès document Grist réel

- Aucun fichier du dépôt ne contient une clé API Grist.
- Aucun fichier ne contient un `documentId` ou un `docId` Grist utilisable de façon directe, hormis l'URL partielle mentionnée.
- Aucun fichier ne contient de configuration secrète (clé API / token) pour Grist.
- Aucun script d'accès backend Grist (Apps Script ou autre) n'est présent dans le dépôt public.

### Accès Supabase

- Le dépôt conserve une dépendance fonctionnelle sur Supabase Edge Functions pour les lectures et l'authentification.
- Cette dépendance est documentée dans `js/pp-config.js`, `0306/base.html`, et plusieurs pages `0306/*.html`.

## Informations exactes nécessaires pour vérifier l'accès Grist réel

1. URL du document Grist actuel
   - Exemple : `https://docs.getgrist.com/<org>/<document>/<...>`
2. Document ID Grist
   - Exemple : `gvPEJV3qAHS9`
3. Clé API Grist ou méthode d'authentification
   - Clé API (lecture seule si possible)
   - Ou jeton OAuth/service account utilisé par Apps Script
4. Tables à lire dans Grist
   - Exemple probable : `Equipements-de-travail-et-produits`, `Diplomes_EN_OK`, `Liste_des_equipements`, `Etablissements_edi`, `Liste_travaux`, `Champs_perso`, etc.
5. Niveau d'autorisation
   - Lecture seule pour l'audit initial
   - Écriture/lecture pour validation fonctionnelle du portail

## Points techniques identifiés

- Le code existant isole bien deux modes : accès Grist embarqué et mode GitHub public.
- En mode GitHub, le dépôt ne dépend pas directement de Grist : il utilise `window.PP_fetchTable` et les Edge Functions.
- Un accès réel à Grist est possible uniquement si la page est exécutée dans un environnement Grist ou si le backend Supabase/Apps Script le traduit.

## Tables et objets potentiellement concernés (référencés dans le code)

- `Diplomes_EN_OK`
- `Liste_des_equipements`
- `Etablissements_edi`
- `Liste_travaux`
- `Agencement_portail`
- `Blocs`
- `Fil_info`
- `Historique_equipements`
- `Champs_perso`
- `_grist_Tables`
- d'autres tables Grist probables liées aux configurations et aux formulaires

## Conclusion

- L'accès Grist réel n'est pas vérifiable uniquement depuis le dépôt : il manque les informations d'authentification et les détails de configuration du document.
- L'URL Grist présente est levée par le code comme référence, mais elle renvoie un 404.

## Recommandation immédiate

Avant de poursuivre le modèle de données et le Book :

- obtenir l'URL du document Grist de production / test;
- obtenir le document ID Grist exact;
- obtenir la clé API Grist ou les informations de méthode d'authentification;
- préciser les tables Grist ciblées;
- préciser le niveau d'autorisation disponible (lecture seule d'abord).

## Avertissement

Aucune table ou colonne n'a été modifiée dans le dépôt pour ce rapport. Ce document est un audit de la configuration Grist existante et des dépendances observées.
