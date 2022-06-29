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
  useCallback, useEffect, useMemo, useState,
} from 'react';

import {
  apiRequest,
  apiUrl,
  errorToast,
  imageUrl,
} from '../../utils';
import {
  IAbilityResponse, IPokemonDetails, IPokemonInstance, IPokemonResponse,
} from '../../utils/Types';
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

  useEffect(() => {
    setDetails({ abilities: [], stats: [], type: form?.type ?? specie.type });
  }, [specie, form]);

  const handleCardClick = useCallback(async () => {
    if (!details.stats.length) {
      setSnackbarOpen(true);
      try {
        const pokemonResponse = await apiRequest<IPokemonResponse>(
          apiUrl(specie, form?.name ?? null),
        );
        const { abilities, stats } = pokemonResponse;

        const abilityResponses = await Promise.all(abilities.map(
          ((ability) => apiRequest<IAbilityResponse>(ability.ability.url)),
        ));

        setDetails((currDetails) => ({
          ...currDetails,
          abilities: abilityResponses.map((res) => {
            const enFlavorTexts = res.flavor_text_entries
              .filter((entry) => entry.language.name === 'en');
            const flavorText = enFlavorTexts[enFlavorTexts.length - 1].flavor_text;

            return {
              name: res.name,
              flavorText,
              isHidden: abilities.find((ability) => ability.ability.name === res.name)!.is_hidden,
            };
          }),
          stats,
        }));
        setModalOpen(true);
        setSnackbarOpen(false);
      } catch (error) {
        setSnackbarOpen(false);
        errorToast.fire({
          text: 'error fetching details',
        });
      }
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
