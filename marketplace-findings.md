# Vérification des marketplaces

## OpenSea

URL fournie : https://opensea.io/collection/punks-base-1

La page se résout vers la collection `Punks` sur le réseau `BASE`. L’interface expose les onglets Items, Offers, Holders, Traits, Activity, Analytics et About. Les filtres visibles incluent All, Listed, Not Listed, Rarity, Price et Marketplaces. La page liste des items de type `Punk #8191`, `Punk #7183`, etc., avec des états listed/not listed et des données de prix lorsque disponibles.

## Rarible

URL fournie : https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items

La page correspond à une collection Punks sur Base par adresse de contrat. Le rendu sandbox est dynamique et ne fournit pas de contenu exploitable dans le navigateur automatisé, mais l’URL contractuelle est suffisamment précise pour servir de destination externe officielle dans le site.

## Décision d’intégration

Le site affichera les métadonnées depuis le contrat et les tokenURI côté navigateur lorsque le contrat expose les fonctions ERC-721 `totalSupply()` et `tokenURI(uint256)`. Chaque carte NFT offrira deux destinations marketplace : OpenSea sous la forme `https://opensea.io/assets/base/{contract}/{tokenId}` et Rarible sous la forme de la collection fournie, avec une destination token pouvant être ajoutée si un format officiel d’item est confirmé.

Les actions Buy, Sell et Listing ne signeront aucune transaction dans le site. Elles redirigeront vers OpenSea ou Rarible, ce qui évite de créer un marketplace interne non vérifié et respecte la stratégie demandée.
