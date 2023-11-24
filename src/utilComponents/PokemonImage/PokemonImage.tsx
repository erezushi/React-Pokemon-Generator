import React from 'react';
import { Link } from '@mui/material';

import { imageUrl } from '../../utils';
import { IPokemonInstance } from '../../utils/Types';

const lastIdOnPokeDB = 1010;
const missingFromDB: string[] = ['Ursaluna-Bloodmoon'];
const defaultForms: string[] = ['Teal Mask'];

interface IPokemonImageProps {
    className: string;
    instance: IPokemonInstance;
    isLinking: boolean;
}

const PokemonImage = (props: IPokemonImageProps) => {
  const {
    className, instance, isLinking,
  } = props;

  const {
    specie, fullName, isShiny, form,
  } = instance;

  if (specie.dexNo <= lastIdOnPokeDB && !missingFromDB.includes(fullName)) {
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
  }

  return isLinking ? (
    <Link href={`https://www.serebii.net/pokemon/${specie.name.toLowerCase()}`}>
      <img
        alt={fullName}
        className={className}
        src={`https://www.serebii.net/${
          isShiny ? 'Shiny/SV' : 'scarletviolet/pokemon'
        }/new/${specie.dexNo}${
          form && !defaultForms.includes(form.name)
            ? `-${form.name[0].toLowerCase()}`
            : ''
        }.png`}
      />
    </Link>
  ) : (
    <img
      alt={fullName}
      className={className}
      src={`https://www.serebii.net/${
        isShiny ? 'Shiny/SV' : 'scarletviolet/pokemon'
      }/new/${specie.dexNo}${
        form && !defaultForms.includes(form.name)
          ? `-${form.name[0].toLowerCase()}`
          : ''
      }.png`}
    />
  );
};

export default PokemonImage;
