import React from 'react';
import { Link } from '@mui/material';

import { imageUrl } from '../../utils';
import { IPokemonInstance } from '../../utils/Types';

const lastIdOnPokeDB = 1025;
const missingFromDB: string[] = [
  'Raichu-Mega-X',
  'Raichu-Mega-Y',
  'Clefable-Mega',
  'Victreebel-Mega',
  'Starmie-Mega',
  'Dragonite-Mega',
  'Meganium-Mega',
  'Feraligatr-Mega',
  'Skarmory-Mega',
  'Chimecho-Mega',
  'Absol-Mega-Z',
  'Staraptor-Mega',
  'Garchomp-Mega-Z',
  'Lucario-Mega-Z',
  'Froslass-Mega',
  'Heatran-Mega',
  'Darkrai-Mega',
  'Emboar-Mega',
  'Excadrill-Mega',
  'Scolipede-Mega',
  'Scrafty-Mega',
  'Eelektross-Mega',
  'Chandelure-Mega',
  'Golurk-Mega',
  'Chesnaught-Mega',
  'Delphox-Mega',
  'Greninja-Mega',
  'Pyroar-Mega',
  'Floette-Eternal',
  'Floette-Mega',
  'Meowstic-Mega',
  'Malamar-Mega',
  'Barbaracle-Mega',
  'Dragalge-Mega',
  'Hawlucha-Mega',
  'Zygarde-Mega',
  'Crabominable-Mega',
  'Golisopod-Mega',
  'Drampa-Mega',
  'Magearna-Mega',
  'Magearna-Mega-Original',
  'Zeraora-Mega',
  'Falinks-Mega',
  'Scovillain-Mega',
  'Glimmora-Mega',
  'Tatsugiri-Mega-Curly',
  'Tatsugiri-Mega-Droopy',
  'Tatsugiri-Mega-Stretchy',
  'Baxcalibur-Mega'
];
const defaultForms: string[] = [''];

interface IPokemonImageProps {
  className: string;
  instance: IPokemonInstance;
  isLinking: boolean;
}

const PokemonImage = (props: IPokemonImageProps) => {
  const { className, instance, isLinking } = props;

  const { specie, fullName, isShiny, form } = instance;

  if (specie.dexNo <= lastIdOnPokeDB && !missingFromDB.includes(fullName)) {
    return isLinking ? (
      <Link href={`https://pokemondb.net/pokedex/${specie.name.toLowerCase()}`}>
        <img alt={fullName} className={className} src={imageUrl(fullName, isShiny)} />
      </Link>
    ) : (
      <img alt={fullName} className={className} src={imageUrl(fullName, isShiny)} />
    );
  }

  return isLinking ? (
    <Link href={`https://www.serebii.net/pokemon/${specie.name.toLowerCase()}`}>
      <img
        alt={fullName}
        className={className}
        src={`https://www.serebii.net/${
          isShiny ? 'Shiny/ZA' : 'legendsz-a/pokemon'
        }/${specie.dexNo.toString().padStart(3, '0')}${
          form && !defaultForms.includes(form.name)
            ? `-${form.name
              .replace('-Curly', '')
              .split('-')
              .map((part) => part[0].toLowerCase())
              .join('')}`
            : ''
        }.png`}
      />
    </Link>
  ) : (
    <img
      alt={fullName}
      className={className}
      src={`https://www.serebii.net/${isShiny ? 'Shiny/ZA' : 'legendsz-a/pokemon'}/${
        specie.dexNo.toString().padStart(3, '0')
      }${
        form && !defaultForms.includes(form.name)
          ? `-${form.name
            .replace('-Curly', '')
            .split('-')
            .map((part) => part[0].toLowerCase())
            .join('')}`
          : ''
      }.png`}
    />
  );
};

export default PokemonImage;
