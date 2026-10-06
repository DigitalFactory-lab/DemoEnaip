# Atelier porte-clés

Application statique de personnalisation de porte-clés pour Digital Factory.

Texte vectorisé localement avec OpenType.js, quatre polices embarquées (Shorebreak Script, Super Waffles, Gemstone et Fat Kat), un motif configurable, union et décalage des contours avec Clipper. La silhouette finale forme une seule pièce, avec un seul trou d’anneau. Les contreformes des lettres ne sont pas découpées. Les dimensions, bordure et diamètre du trou sont exprimés en millimètres.

Exports laser SVG avec tracé rouge de 0,01 mm ; UV SVG avec chemins colorés ; UV PNG transparent à 600 ppp avec métadonnées pHYs. Les SVG partagent la même origine et le même format. Le PNG conserve ce format à l’arrondi d’un pixel près. Ne pas recadrer les exports avant le positionnement dans le logiciel d’impression. Le support choisi (plexi noir, plexi blanc ou bois clair) apparaît dans l’aperçu uniquement. Les yeux et le nez du crâne sont des contreformes transparentes dans les exports UV SVG et PNG ; ils ne créent aucune découpe laser supplémentaire. Le veinage du bois est une représentation indicative. La sous-couche de blanc doit conserver ces transparences. La sous-couche de blanc, les paramètres machine et le gabarit physique sont à préparer dans le logiciel machine.

Les ponts nécessaires à l’union sont ajoutés automatiquement. Les réglages ne constituent pas une validation de résistance pour un matériau donné. Une découpe et une impression d’essai permettent de valider le réglage choisi.

## Développement

`npm ci`, `npm run build`, `node src/verify.mjs`.

Sources dans `src/`, sortie statique à la racine. Les licences des polices sont dans `assets/LICENSE-*.txt`.

## GitHub Pages

Dans Settings → Pages, sélectionner Deploy from a branch, puis main et / (root).

Le site fonctionne aussi depuis un serveur statique local. Les retours à la ligne, l’interligne, la bordure et la distance du motif sont réglables.
