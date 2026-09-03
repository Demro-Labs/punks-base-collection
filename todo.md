# Extension — Full Live Collection Index

- [x] Auditer la pagination actuelle et le curseur token.
- [x] Charger toute la supply par lots contrôlés jusqu’à 10 000 tokens.
- [x] Ajouter la progression, l’état de pause/erreur et le chargement total.
- [x] Préserver l’accès aux images, descriptions et attributs réels.
- [x] Vérifier les performances et le rendu responsive.
- [x] Recompiler et sauvegarder la galerie complète.

## Extension — Live NFT & Metadata

- [x] Vérifier le lecteur `totalSupply()` et `tokenURI()` existant.
- [x] Afficher en direct image, nom, token ID, description et attributs.
- [x] Garantir la résolution IPFS/Arweave et les états d’erreur.
- [x] Vérifier le chargement progressif et la fiche détaillée.
- [x] Recompiler et synchroniser la version finale.

## Nouvelle contrainte — Collection Base Mainnet

- [x] Confirmer que la collection `0xb9110ba3266f4983193c0d5f55c792a94368af28` est sur Base Mainnet, Chain ID 8453.
- [x] Paramétrer le futur marketplace pour cette collection Mainnet.
- [ ] Garder Base Sepolia uniquement pour les tests avec des NFT de test.
- [ ] Ne pas déployer le marketplace Mainnet avant audit et confirmation explicite.

## Configuration — Royalties marketplace

- [x] Enregistrer une royalty de 10 %.
- [x] Enregistrer l’adresse bénéficiaire `0x92524f2a43a4337d6b475d78c3ba9e70f5d3a000`.
- [x] Confirmer l’architecture : contrat marketplace personnalisé.
- [x] Confirmer le réseau de test avant tout déploiement : Base Sepolia.
- [x] Ajouter la configuration non exécutoire au site et à la documentation.
- [x] Ne pas déployer ni signer de transaction sans confirmation explicite.

## Nouvelle demande — On-chain marketplace Base / MetaMask

- [x] Définir la source de vérité on-chain et les fonctions ERC-721 nécessaires.
- [x] Vérifier l’architecture d’achat, de vente et de listing sans créer de fausse transaction.
- [x] Renforcer la lecture Base et la connexion MetaMask côté frontend.
- [x] Ajouter un draft d’adaptateur marketplace et un ABI minimal; le contrat reste non déployé et non audité.
- [ ] Ne pas déployer un smart contract réel sans audit, paramètres et confirmation explicite.
- [x] Tester les flux frontend en mode lecture seule; les tests Solidity nécessitent Foundry/OpenZeppelin dans l’environnement de développement.
- [x] Documenter les étapes de déploiement et les risques.

## Modification — Descriptions 100 % English

- [x] Définir un texte anglais commun pour GitHub et GitHub Pages.
- [x] Vérifier la meta description et la langue HTML du site.
- [x] Mettre à jour la description officielle du repository GitHub.
- [x] Vérifier les deux affichages et synchroniser la version finale.

## Modification — Description du dépôt GitHub

- [ ] Vérifier le champ Description actuel du repository.
- [ ] Définir une description anglaise courte et exacte.
- [ ] Mettre à jour le champ Description du dépôt GitHub.
- [ ] Vérifier que le nouveau texte est bien enregistré.

## Modification — Lien GitHub Punks

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

## Extension — Dedicated Live Gallery

- [x] Définir une route/page Gallery dédiée à la collection complète.
- [x] Réutiliser les appels live `totalSupply()` et `tokenURI()` de Base Mainnet.
- [x] Afficher l’image réelle, le token ID, le nom, la description et tous les traits.
- [x] Ajouter recherche, filtres par traits, tri et état de synchronisation.
- [x] Ajouter chargement progressif et bouton de chargement complet jusqu’à 10 000 NFT.
- [x] Tester le rendu responsive, TypeScript et le build de production.
- [x] Sauvegarder et publier la nouvelle galerie.

## Incident — Direct GitHub Pages Gallery URL

- [x] Confirmer le 404 sur `/punks-base-collection/gallery` alors que la racine fonctionne.
- [x] Ajouter un fallback GitHub Pages pour les routes SPA directes.
- [x] Vérifier la navigation depuis l’accueil et l’ouverture directe de la galerie.
- [x] Synchroniser et publier la correction.

## Metadata gateway correction

- [x] Confirmer que la supply live répond à 10 000.
- [x] Tester les tokenURI et les métadonnées réelles du token #1.
- [x] Prioriser la passerelle IPFS Filebase compatible CORS dans l’accueil et la galerie.
- [x] Conserver IPFS.io et dweb.link comme fallbacks.
- [x] Valider TypeScript, build, fallback SPA et URLs d’assets.

## Confirmed follow-up — Gallery access and details

- [x] Ajouter un second `View Full Collection` dans la section `The collection`.
- [x] Ajouter un bouton `Back to home` dans la galerie dédiée.
- [x] Ajouter une fiche détaillée au clic sur chaque NFT avec image et métadonnées live.
- [x] Vérifier les interactions desktop/mobile, TypeScript et le build.
- [x] Sauvegarder et publier la mise à jour.

## Modification — Home access button

- [x] Ajouter le bouton anglais `View Full Collection` sur la page d’accueil.
- [x] Relier le bouton à la Live Gallery complète.
- [x] Vérifier le rendu desktop/mobile, le build et publier la modification.

## Performance update — Fast live loading and per-token refresh

- [x] Regrouper les appels `tokenURI()` dans des requêtes RPC batch.
- [x] Limiter la concurrence metadata et essayer les passerelles IPFS en parallèle avec timeout.
- [x] Supprimer les Promises rejetées du cache pour permettre un nouveau retry.
- [x] Afficher les cartes progressivement sans attendre toute la batch.
- [x] Ajouter `Refresh` sur chaque carte dans l’accueil et la Live Gallery.
- [x] Gérer les erreurs de refresh via un retour utilisateur sans interrompre les autres NFT.
- [x] Valider TypeScript, build production, rendu et interaction du bouton Refresh.

## Final GitHub update — Retry, local cache and progress

- [x] Add IndexedDB cache for resolved live NFT metadata.
- [x] Restore cached records immediately while live Base reads continue.
- [x] Add failure callbacks and a retry queue for temporary RPC/IPFS failures.
- [x] Add detailed scanned/readable/pending/retry progress to Gallery.
- [x] Add retry controls and preserve per-NFT Refresh actions.
- [x] Validate TypeScript, production build and responsive Gallery rendering.

## Image retry correction

- [x] Add a shared image cache-busting helper for per-token reloads.
- [x] Detect failed NFT images and show `Image unavailable — press Refresh`.
- [x] Reload image and metadata together from Home and Live Gallery.
- [x] Verify the invalid-image recovery flow with a real DOM interaction.
- [ ] Commit, push and verify the GitHub Pages workflow.

## Style reminder — Gallery

La galerie reprend le design « Base Terminal » : interface anglaise, surfaces graphite/ivory, accent orange Base Signal, typographie condensée de terminal, bordures techniques et mise en page éditoriale non centrée.
