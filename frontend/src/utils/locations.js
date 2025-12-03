/**
 * Liste complète des localités du Burkina Faso
 * Utilisée pour les formulaires d'inscription et les filtres
 * Plus de 50 villes et localités principales du Burkina Faso
 */
export const BURKINA_FASO_LOCATIONS = [
  // Villes principales et capitales régionales
  { value: 'Ouagadougou', label: 'Ouagadougou' },
  { value: 'Bobo-Dioulasso', label: 'Bobo-Dioulasso' },
  { value: 'Koudougou', label: 'Koudougou' },
  { value: 'Ouahigouya', label: 'Ouahigouya' },
  { value: 'Banfora', label: 'Banfora' },
  { value: 'Dédougou', label: 'Dédougou' },
  { value: 'Kaya', label: 'Kaya' },
  { value: 'Dori', label: 'Dori' },
  { value: 'Fada N\'gourma', label: 'Fada N\'gourma' },
  { value: 'Tenkodogo', label: 'Tenkodogo' },
  { value: 'Manga', label: 'Manga' },
  { value: 'Zorgho', label: 'Zorgho' },
  { value: 'Gaoua', label: 'Gaoua' },
  { value: 'Réo', label: 'Réo' },
  { value: 'Nouna', label: 'Nouna' },
  { value: 'Tougan', label: 'Tougan' },
  { value: 'Djibo', label: 'Djibo' },
  { value: 'Gorom-Gorom', label: 'Gorom-Gorom' },
  { value: 'Kombissiri', label: 'Kombissiri' },
  { value: 'Houndé', label: 'Houndé' },
  { value: 'Koupéla', label: 'Koupéla' },
  { value: 'Pô', label: 'Pô' },
  { value: 'Bittou', label: 'Bittou' },
  { value: 'Bogandé', label: 'Bogandé' },
  { value: 'Boulsa', label: 'Boulsa' },
  { value: 'Gourcy', label: 'Gourcy' },
  { value: 'Kongoussi', label: 'Kongoussi' },
  { value: 'Léo', label: 'Léo' },
  { value: 'Niangoloko', label: 'Niangoloko' },
  { value: 'Orodara', label: 'Orodara' },
  { value: 'Pissila', label: 'Pissila' },
  { value: 'Sapouy', label: 'Sapouy' },
  { value: 'Sindou', label: 'Sindou' },
  { value: 'Solenzo', label: 'Solenzo' },
  { value: 'Toma', label: 'Toma' },
  { value: 'Yako', label: 'Yako' },
  { value: 'Ziniaré', label: 'Ziniaré' },
  { value: 'Boussé', label: 'Boussé' },
  { value: 'Garango', label: 'Garango' },
  { value: 'Kokologho', label: 'Kokologho' },
  { value: 'Pouytenga', label: 'Pouytenga' },
  { value: 'Barsalogho', label: 'Barsalogho' },
  { value: 'Boromo', label: 'Boromo' },
  { value: 'Diébougou', label: 'Diébougou' },
  { value: 'Kantchari', label: 'Kantchari' },
  { value: 'Mangodara', label: 'Mangodara' },
  { value: 'Sebba', label: 'Sebba' },
  { value: 'Tikaré', label: 'Tikaré' },
  { value: 'Arbinda', label: 'Arbinda' },
  { value: 'Batié', label: 'Batié' },
  { value: 'Boussouma', label: 'Boussouma' },
  { value: 'Dano', label: 'Dano' },
  { value: 'Di', label: 'Di' },
  { value: 'Gayeri', label: 'Gayeri' },
  { value: 'Loropeni', label: 'Loropeni' },
  { value: 'Mogtedo', label: 'Mogtedo' },
  { value: 'Pama', label: 'Pama' },
  { value: 'Titao', label: 'Titao' },
  { value: 'Autres', label: 'Autres (saisir manuellement)' }
];

/**
 * Obtient les options de localisation pour les filtres (sans "Autres")
 */
export const getLocationFilterOptions = () => {
  return BURKINA_FASO_LOCATIONS.filter(loc => loc.value !== 'Autres');
};
