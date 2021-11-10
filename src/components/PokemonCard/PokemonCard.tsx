import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@material-ui/core';
import { StarRounded } from '@material-ui/icons';
import axios from 'axios';
import React, { useCallback, useMemo, useState } from 'react';

import { IPokemonDetails, IPokemonInstance, IPokemonResponse } from '../../utils/Types';
import {
  apiUrl,
  errorToast,
  imageUrl,
  alcremieForm,
  shinyReplacements,
} from '../../utils/utils';
import DetailsModal from '../DetailsModal';
import LoadingSnackbar from '../LoadingSnackbar';

import './PokemonCard.css';

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

const PokemonCard: React.FC<ICardProps> = ({ instance }: ICardProps) => {
  const { specie, isShiny, form } = instance;

  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [details, setDetails] = useState<IPokemonDetails>(
    { abilities: [], stats: [], type: form?.type ?? specie.type },
  );
  const [isModalOpen, setModalOpen] = useState(false);

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
    setSnackbarOpen(true);

    if (!details.stats.length) {
      axios.get(apiUrl(specie, form?.name ?? null))
        .then((res: IPokemonResponse) => {
          const { abilities, stats } = res.data;
          setDetails((currDetails) => ({ ...currDetails, abilities, stats }));
          setModalOpen(true);
          setSnackbarOpen(false);
        })
        .catch(() => {
          errorToast.fire({
            text: 'error fetching base stats',
          });
        });
    } else {
      setModalOpen(true);
      setSnackbarOpen(false);
    }
  }, [details.stats.length, form?.name, specie]);

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
      <LoadingSnackbar
        isOpen={isSnackbarOpen}
        name={fullName}
      />
      <DetailsModal
        details={details}
        fullName={fullName}
        instance={instance}
        isOpen={isModalOpen}
        setOpen={setModalOpen}
      />
    </Card>
  );
};

export default PokemonCard;
