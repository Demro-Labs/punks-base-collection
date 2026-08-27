# Modification — Lien GitHub Punks

- [x] Remplacer le lien GitHub générique dans le site.
- [x] Vérifier le lien direct vers `Demro-Labs/punks-base-collection`.
- [x] Recompiler et synchroniser la mise à jour vers GitHub Pages.

## Incident précédent — Images absentes sur GitHub Pages

- [x] Ajouter les quatre PNG dans un dossier d’assets versionné du dépôt.
- [x] Remplacer les chemins `/manus-storage` par des chemins compatibles avec le sous-chemin GitHub Pages.
- [x] Vérifier le favicon, le badge et les trois items dans le build.
- [ ] Synchroniser, relancer Pages et tester les URLs d’images.

## Incident précédent — Modifications non appliquées sur GitHub

- [ ] Comparer le commit du dépôt avec la version locale finale.
- [ ] Vérifier que les fichiers `Home.tsx`, `index.css`, `index.html` et l’asset `verifier` sont bien dans le dépôt distant.
- [ ] Synchroniser la dernière version vers GitHub.
- [ ] Relancer GitHub Pages et contrôler le nouveau commit publié.

## Incident précédent — GitHub Pages non synchronisé

- [ ] Comparer le commit GitHub, le dernier workflow et la version publiée.
- [ ] Vérifier que les nouveaux assets sont présents dans le dépôt et l’artefact.
- [ ] Resynchroniser ou relancer le workflow sur `main`.
- [ ] Vérifier la version publiée avec cache contourné.
- [ ] Informer l’utilisateur de l’URL et du résultat.

## Modification — Badge Verified on Base fourni

- [x] Copier et héberger l’icône `verifier.png`.
- [x] Remplacer les coches actuelles par l’icône de vérification bleue.
- [x] Vérifier le rendu desktop et mobile.
- [x] Sauvegarder et synchroniser la version vers GitHub.

## Incident précédent — JSX après intégration des assets

- [ ] Corriger la fermeture JSX incorrecte dans la zone featured items.
- [ ] Recompiler et vérifier TypeScript.
- [ ] Capturer le rendu pour confirmer l’icône, les trois items et Verified on Base.
- [ ] Sauvegarder la version corrigée.

## Modification — Assets Punks/BASE fournis

- [x] Copier les quatre images fournies vers le répertoire d’assets statiques.
- [x] Héberger les assets avec des URLs persistantes WebDev.
- [x] Utiliser l’image principale comme favicon, icône de marque et visuel d’identité.
- [x] Utiliser trois images comme fiches items visibles dans la page.
- [x] Ajouter le badge Verified on Base avec une coche.
- [x] Vérifier le rendu desktop/mobile et sauvegarder la version finale.

## Incident précédent — 404 interne sur GitHub Pages

- [x] Confirmer que GitHub Pages sert bien l’application mais que le routeur reçoit `/punks-base-collection/`.
- [x] Adapter le routeur pour accepter le sous-chemin GitHub Pages.
- [x] Vérifier les chemins d’assets et les liens internes.
- [x] Recompiler et vérifier l’URL Pages.
- [ ] Synchroniser la correction vers GitHub.

## Modification — Suppression de WalletConnect

- [x] Repérer les références WalletConnect dans le code, le workflow et la documentation.
- [x] Retirer le bouton et la logique WalletConnect de l’interface.
- [x] Supprimer la dépendance WalletConnect et sa variable du workflow; le fichier d’exemple protégé n’a pas été modifié automatiquement.
- [x] Mettre à jour README et pull request.
- [x] Recompiler et sauvegarder la version sans WalletConnect.

## Blocage précédent — Dépôt GitHub privé et Pages

- [x] Confirmer que le dépôt `Demro-Labs/punks-base-collection` est privé.
- [x] Confirmer que l’API GitHub Pages renvoie HTTP 403 et que les runs échouent avant le build.
- [ ] Rendre le dépôt public ou vérifier l’éligibilité GitHub Pages du plan du compte.
- [ ] Activer Pages manuellement avec la source GitHub Actions.
- [ ] Relancer le workflow et vérifier le déploiement.

## Incident précédent — GitHub Pages non activé

- [ ] Ajouter `pages: write` au job de configuration Pages.
- [ ] Activer `configure-pages` avec `enablement: true`.
- [ ] Mettre à jour la documentation de publication.
- [ ] Synchroniser la correction et relancer l’exécution GitHub Actions.
- [ ] Vérifier que le déploiement termine avec succès.

## Incident précédent — Versions pnpm multiples

- [x] Inspecter `package.json`, le lockfile et tous les workflows qui déclarent pnpm.
- [x] Choisir une seule source de vérité pour la version pnpm.
- [x] Corriger le workflow et supprimer les déclarations concurrentes.
- [x] Valider `pnpm install --frozen-lockfile`, le build et l’artefact Pages.
- [x] Mettre à jour le pull request et fournir la procédure de synchronisation.

## Incident précédent — Installation pnpm GitHub Pages

- [x] Remplacer l’action pnpm fragile par une installation explicite et reproductible.
- [x] Fixer Node 22 dans le workflow et vérifier la version pnpm.
- [x] Recompiler et contrôler l’artefact `dist/public`.
- [x] Mettre à jour la documentation du pull request.
- [ ] Demander la ligne d’erreur complète si le runner échoue encore.

## Incident précédent — Pull request / GitHub Pages refusé

- [x] Inspecter le workflow GitHub Pages, le package et la configuration Vite.
- [x] Vérifier si le workflow attend le mauvais dossier de build ou de mauvaises permissions.
- [x] Corriger le workflow et la documentation du pull request.
- [x] Recompiler et valider le workflow corrigé.
- [ ] Demander le message d’erreur exact si le refus concerne une règle propre au dépôt.

## Extension demandée — Images réelles de la collection

- [x] Supprimer les images générées utilisées comme fallback dans les cartes NFT.
- [x] Afficher uniquement les images renvoyées par les tokenURI et métadonnées réelles.
- [x] Ajouter un état neutre de chargement et un état d’erreur sans faux NFT.
- [x] Vérifier le premier token réel et le rendu des images IPFS/Arweave; les gateways IPFS publiques restent dépendantes de leur disponibilité réseau.
- [x] Recompiler, capturer le rendu et sauvegarder la version finale.

## Extension précédente — Index on-chain et marketplaces externes

- [x] Vérifier les URL OpenSea et Rarible fournies par le propriétaire.
- [x] Charger `totalSupply`, `tokenURI`, images, description et attributes depuis le contrat sur Base.
- [x] Remplacer les cartes NFT éditoriales par des cartes issues des métadonnées on-chain.
- [x] Ajouter les liens d’achat/vente OpenSea et Rarible au niveau collection et token.
- [x] Ajouter des états loading, error, empty et metadata unavailable.
- [x] Mettre à jour les dashboards pour refléter une marketplace externe.
- [x] Vérifier le build, l’affichage et le responsive.
- [x] Réécrire le pull request avec la nouvelle stratégie.

## Extension précédente — Wallet Creator / Marketplace

- [x] Traduire toute l’interface en anglais américain cohérent.
- [x] Ajouter un dashboard Creator avec état de collection, mint/configuration et liens de contrat.
- [x] Ajouter un dashboard Wallet avec solde, adresse, réseau et vues My NFTs / Activity.
- [x] Ajouter les parcours Buy, Sell et Listing avec modales de confirmation et états d’erreur.
- [x] Finaliser le connecteur WalletConnect et documenter `VITE_WALLETCONNECT_PROJECT_ID`; l’identifiant propriétaire reste à renseigner.
- [x] Ne jamais simuler une transaction : afficher clairement les fonctions dépendantes d’un marketplace contract/API vérifié.
- [x] Ajouter les tests de build et la vérification responsive finale.
- [x] Mettre à jour `PULL_REQUEST.md` avec les nouvelles fonctionnalités et la configuration.
