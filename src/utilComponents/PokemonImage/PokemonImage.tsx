import React from 'react';
import { Link } from '@mui/material';

import { imageUrl } from '../../utils';
import { IPokemonInstance } from '../../utils/Types';

const missingFormImages: Record<string, number> = {
  'Tauros-Combat': 10250,
  'Tauros-Blaze': 10251,
  'Tauros-Aqua': 10252,
  'Wooper-Paldean': 10253,
  'Oinkologne-F': 10254,
  'Dudunsparce-Three-Segment': 10255,
  'Palafin-Hero': 10256,
  'Maushold-Family-Of-Three': 10257,
  'Tatsugiri-Droopy': 10258,
  'Tatsugiri-Stretchy': 10259,
  'Squawkabilly-Blue-Plumage': 10260,
  'Squawkabilly-Yellow-Plumage': 10261,
  'Squawkabilly-White-Plumage': 10262,
  'Gimmighoul-Roaming': 10263,
};

/*
  URL is too long to be in one single line,
  joined array is the only way to break it up
*/
const pokeApiUrl = [
  'https:',
  '',
  'raw.githubusercontent.com',
  'PokeAPI',
  'sprites',
  'master',
  'sprites',
  'pokemon',
  'other',
  'official-artwork',
].join('/');

interface IPokemonImageProps {
    className: string;
    instance: IPokemonInstance;
    isLinking: boolean;
}

const PokemonImage = (props: IPokemonImageProps) => {
  const {
    className, instance, isLinking,
  } = props;

  const { specie, fullName, isShiny } = instance;

  let imageSrc = missingFormImages[fullName]
    ? `${pokeApiUrl}/${isShiny ? 'shiny/' : ''}${missingFormImages[fullName]}.png`
    : '';

  if (!imageSrc) {
    const { dexNo } = specie;

    imageSrc = dexNo <= 905
      ? imageUrl(instance.fullName, isShiny)
      : `${pokeApiUrl}/${
        isShiny ? 'shiny/' : ''
      }${dexNo}.png`;
  }

  return isLinking ? (
    <Link
      href={`https://pokemondb.net/pokedex/${instance.specie.name.toLowerCase()}`}
    >
      <img
        alt={instance.fullName}
        className={className}
        src={imageSrc}
      />
    </Link>
  ) : (
    <img
      alt={instance.fullName}
      className={className}
      src={imageSrc}
    />
  );
};

export default PokemonImage;
