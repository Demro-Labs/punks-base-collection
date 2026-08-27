# Incident — Pull request / GitHub Pages refusé

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
