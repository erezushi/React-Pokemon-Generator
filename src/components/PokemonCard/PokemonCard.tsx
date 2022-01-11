import { StarRounded } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@mui/material';
import axios from 'axios';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import {
  apiUrl,
  errorToast,
  imageUrl,
  alcremieForm,
  shinyReplacements,
} from '../../utils';
import { IPokemonDetails, IPokemonInstance, IPokemonResponse } from '../../utils/Types';
import DetailsModal from '../DetailsModal';
import LoadingSnackbar from '../LoadingSnackbar';

import './PokemonCard.css';

const specialChars = /[♂ ♀é]/g;

const charMap: Record<string, string> = {
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

  const [fullName, setFullName] = useState(
    `${specie.name}${(form && form.name !== 'default') ? `-${form.name}` : ''}`,
  );
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [details, setDetails] = useState<IPokemonDetails>(
    { abilities: [], stats: [], type: form?.type ?? specie.type },
  );
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (specie.name === 'Alcremie' && form?.name === 'default') {
      setFullName((prevFullName) => `${prevFullName}-${alcremieForm()}`);
    }

    if (isShiny) {
      shinyReplacements.forEach((value, key) => {
        setFullName((prevFullName) => prevFullName.replace(key, value));
      });
    }
  }, [form?.name, isShiny, specie.name]);

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
          setSnackbarOpen(false);
          errorToast.fire({
            text: 'error fetching base stats',
          });
        });
    } else {
      setModalOpen(true);
      setSnackbarOpen(false);
    }
  }, [details.stats.length, form?.name, specie]);

  const links = useMemo<Record<string, string>>(() => {
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
      <CardMedia>
        <img alt={fullName} className="card-img" src={imageUrl(fullName, isShiny)} />
      </CardMedia>
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
