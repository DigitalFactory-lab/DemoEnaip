# Atelier porte-clés

Application statique de personnalisation de porte-clés pour Digital Factory.

Texte vectorisé localement avec OpenType.js, six polices embarquées (Shorebreak Script, Super Waffles, Gemstone, Fat Kat, Monttee et Anak Baik), un motif configurable, union et décalage des contours avec Clipper. La silhouette finale forme une seule pièce, avec un seul trou d’anneau. Les contreformes des lettres ne sont pas découpées. Les dimensions, bordure et diamètre du trou sont exprimés en millimètres.

Exports laser PDF vectoriel avec tracé noir de 0,6 mm ; UV PDF vectoriel avec chemins colorés ; UV PNG transparent à 600 ppp avec métadonnées pHYs. Les PDF partagent la même origine et le même format. Le PNG conserve ce format à l’arrondi d’un pixel près. Ne pas recadrer les exports avant le positionnement dans le logiciel d’impression. Le support choisi (plexi noir, plexi blanc ou bois clair) apparaît dans l’aperçu uniquement. Les yeux et le nez du crâne sont des contreformes transparentes dans les exports UV PDF et PNG ; ils ne créent aucune découpe laser supplémentaire. Le veinage du bois est une représentation indicative. La sous-couche de blanc doit conserver ces transparences. La sous-couche de blanc, les paramètres machine et le gabarit physique sont à préparer dans le logiciel machine.

Les ponts nécessaires à l’union sont ajoutés automatiquement. Les réglages ne constituent pas une validation de résistance pour un matériau donné. Une découpe et une impression d’essai permettent de valider le réglage choisi.

## Développement

`npm ci`, `npm run build`, `node src/verify.mjs`.

Sources dans `src/`, sortie statique à la racine. Les licences des polices sont dans `assets/LICENSE-*.txt`.

## GitHub Pages

Dans Settings → Pages, sélectionner Deploy from a branch, puis main et / (root).

Le site fonctionne aussi depuis un serveur statique local. Les retours à la ligne, l’interligne, la bordure et la distance du motif sont réglables.

Les PDF sont générés localement via jsPDF et svg2pdf.js. Chaque page reprend les dimensions exactes du porte-clés en mm, sans marge ni fond de matériau. Le laser contient uniquement des traits vectoriels noirs ; l’UV conserve les contreformes et les couleurs, y compris le blanc. Les couches spéciales VersaWorks (blanc/vernis/découpe) restent à configurer dans le logiciel de production.

Polices ajoutées : Monttee et Anak Baik, Khurasan — https://www.dafont.com/monttee.font et https://www.dafont.com/anak-baik.font (fichiers téléchargés le 6 octobre 2026). Notices originales conservées dans assets/.
