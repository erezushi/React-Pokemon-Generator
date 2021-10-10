import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { StarRounded } from '@material-ui/icons';
import axios from 'axios';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { IPokemonInstance, IPokemonResponse } from '../../utils/Types';
import {
  apiUrl,
  errorToast,
  imageUrl,
  Toast,
  alcremieForm,
  shinyReplacements,
} from '../../utils/utils';

import './PokemonCard.css';

const ReactToast = withReactContent(Toast);

const specialChars = /[♂ ♀é]/g;

const charMap: {[char: string]: string} = {
  '♂': 'm',
  ' ': '',
  '♀': 'f',
  é: 'e',
};

const sites = [
  'bulbapedia',
  'serebii',
  'smogon',
];

interface ICardProps {
  instance: IPokemonInstance,
}

const PokemonCard = ({ instance }: ICardProps) => {
  const { specie, isShiny, form } = instance;

  let fullName = `${specie.name}${(form && form.name !== 'default') ? `-${form.name}` : ''}`;

  if (specie.name === 'Alcremie' && form?.name === 'default') {
    fullName = `${fullName}-${alcremieForm()}`;
  }

  if (isShiny) {
    shinyReplacements.forEach((value, key) => {
      fullName = fullName.replace(key, value);
    });
  }

  const handleCardClick = useCallback(() => {
    ReactToast.fire({
      title: fullName,
      html: (
        <div className="stats-loader">
          Loading base Stats...
          <br />
          <CircularProgress />
        </div>
      ),
    });

    axios.get(apiUrl(specie, form?.name ?? null))
      .then((res: IPokemonResponse) => {
        const statNames = [
          'HP',
          'Attack',
          'Sp. Atk',
          'Defense',
          'Sp. Def',
          'Speed',
        ];
        let html = `Type: ${
          specie.type.split(' ').map((type) => _.startCase(type)).join(' / ')
        }<br/>`;

        const { stats, abilities } = res.data;

        html = `${html}Abilities: ${
          abilities
            .filter((ability) => !ability.is_hidden)
            .map((ability) => _.startCase(ability.ability.name/* .replace('-', ' ') */))
            .join(' / ')
        }${abilities.some((ability) => ability.is_hidden)
          ? `<br />Hidden Ability: ${
            _.startCase(abilities.find((ability) => ability.is_hidden)!.ability.name)
          }`
          : ''}<br /> <br />`;

        let total = 0;
        stats.forEach((stat, index) => {
          const { base_stat: base } = stat;
          html = `${html}${statNames[index]}: ${base}<br />`;
          total += base;
        });

        html = `${html}<b>BST:</b> ${total}`;

        Swal.fire({
          title: `${fullName}
            #${specie.dexNo!.toString().padStart(3, '0')}`,
          imageUrl: imageUrl(fullName, isShiny),
          html,
        });
      })
      .catch(() => {
        errorToast.fire({
          text: 'error fetching base stats',
        });
      });
  }, [form?.name, fullName, isShiny, specie]);

  const links = useMemo<{[site: string]: string}>(() => {
    const { name } = specie;
    return ({
      bulbapedia: `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`,
      serebii: `https://www.serebii.net/pokemon/${
        name.toLowerCase().replace(specialChars, (match) => charMap[match])
      }/`,
      smogon: `https://www.smogon.com/dex/ss/pokemon/${
        name.replace(specialChars, (match) => charMap[match])
      }/`,
    });
  }, [specie]);

  const handleButtonClick = useCallback((event) => {
    const { textContent } = event.target as HTMLButtonElement;
    window.open(links[textContent!]);
    event.stopPropagation();
  }, [links]);

  return (
    <Card className="pokemon-card" onClick={handleCardClick}>
      <CardMedia
        className="card-img"
        image={imageUrl(fullName, isShiny)}
      />
      <CardContent>
        <Typography variant="h5">
          {fullName}
          {isShiny && (
          <span>
            &nbsp;
            <StarRounded fontSize="small" />
          </span>
          )}
        </Typography>
      </CardContent>
      <CardActions>
        {sites.map((site) => (
          <Button
            key={site}
            className={`card-link
            ${site}`}
            onClick={handleButtonClick}
            variant="contained"
          >
            {site}
          </Button>
        ))}
      </CardActions>
    </Card>
  );
};

export default PokemonCard;
