import React from 'react';
import { Link } from '@mui/material';

import { imageUrl } from '../../utils';
import { IPokemonInstance } from '../../utils/Types';

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

  return isLinking ? (
    <Link
      href={`https://pokemondb.net/pokedex/${specie.name.toLowerCase()}`}
    >
      <img
        alt={fullName}
        className={className}
        src={imageUrl(fullName, isShiny)}
      />
    </Link>
  ) : (
    <img
      alt={fullName}
      className={className}
      src={imageUrl(fullName, isShiny)}
    />
  );
};

export default PokemonImage;
