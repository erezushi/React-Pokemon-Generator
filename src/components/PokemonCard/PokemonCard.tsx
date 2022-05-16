import StarRounded from '@mui/icons-material/StarRounded';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@mui/material';
import React, {
  useCallback, useMemo, useState,
} from 'react';

import {
  apiRequest,
  apiUrl,
  errorToast,
  imageUrl,
} from '../../utils';
import { IPokemonDetails, IPokemonInstance, IPokemonResponse } from '../../utils/Types';
import DetailsModal from '../DetailsModal';
import LoadingSnackbar from '../LoadingSnackbar';

import './PokemonCard.css';

const specialChars = /[♂ ♀é]/g;

const specialCharMap: Record<string, string> = {
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

const PokemonCard = (props: ICardProps) => {
  const { instance } = props;
  const { specie, isShiny, form } = instance;

  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [details, setDetails] = useState<IPokemonDetails>(
    { abilities: [], stats: [], type: form?.type ?? specie.type },
  );
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCardClick = useCallback(() => {
    if (!details.stats.length) {
      setSnackbarOpen(true);
      apiRequest<IPokemonResponse>(apiUrl(specie, form?.name ?? null))
        .then((res) => {
          const { abilities, stats } = res;
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
    }
  }, [details.stats.length, form?.name, specie]);

  const links = useMemo<Record<string, string>>(() => {
    const { name } = specie;

    return ({
      bulbapedia: `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`,
      serebii: `https://www.serebii.net/pokemon/${
        name.toLowerCase().replace(specialChars, (match) => specialCharMap[match])
      }/`,
      smogon: `https://www.smogon.com/dex/ss/pokemon/${
        name.replace(specialChars, (match) => specialCharMap[match])
      }/`,
    });
  }, [specie]);

  const handleButtonClick = useCallback((
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const { textContent } = event.target as HTMLButtonElement;
    window.open(links[textContent!]);
    event.stopPropagation();
  }, [links]);

  return (
    <Card className="pokemon-card" onClick={handleCardClick}>
      <CardMedia>
        <img
          alt={instance.fullName}
          className="card-img"
          src={imageUrl(instance.fullName, isShiny)}
        />
      </CardMedia>
      <CardContent>
        <Typography variant="h5">
          {instance.fullName.replace(/-em$/, '-!').replace(/-qm$/, '-?')}
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
        name={instance.fullName}
      />
      <DetailsModal
        details={details}
        instance={instance}
        isOpen={isModalOpen}
        setOpen={setModalOpen}
      />
    </Card>
  );
};

export default PokemonCard;
