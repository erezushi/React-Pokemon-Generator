import StarRounded from '@mui/icons-material/StarRounded';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { LoadingSnackbar } from '../../utilComponents';
import {
  apiRequest,
  apiUrl,
  errorToast,
  generateLink,
  imageUrl,
  siteLinks,
} from '../../utils';
import {
  IAbilityResponse, IPokemonDetails, IPokemonInstance, IPokemonResponse,
} from '../../utils/Types';
import DetailsModal from '../DetailsModal';

import './PokemonCard.css';

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
    setModalOpen(false);
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

  const handleButtonClick = useCallback((
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const { classList } = event.target as HTMLButtonElement;
    window.open(generateLink(siteLinks[classList.item(7)!], specie.name));
    event.stopPropagation();
  }, [specie.name]);

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
        {Object.keys(siteLinks).map((site) => (
          <Button
            key={site}
            className={`card-link ${site}`}
            onClick={handleButtonClick}
            variant="contained"
          >
            {site.replace('poke', 'poké')}
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
