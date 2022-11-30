import { PokemonType } from '@erezushi/pokemon-randomizer';
import ArrowRightAltRounded from '@mui/icons-material/ArrowRightAltRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import {
  Card,
  CardContent,
  CardMedia,
  Link,
  Modal,
  Tooltip,
  Typography,
} from '@mui/material';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { TypeIcon } from '../../utilComponents';
import {
  Evolution,
  getGeneration,
  imageUrl,
  nextEvos,
  prevEvos,
  STAT_NAMES,
} from '../../utils';
import { IPokemonDetails, IPokemonInstance } from '../../utils/Types';

import './DetailsModal.css';

interface IDetailsModalProps {
    details: IPokemonDetails,
    instance: IPokemonInstance,
    isOpen: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DetailsModal = (props: IDetailsModalProps) => {
  const {
    details, instance, isOpen, setOpen,
  } = props;

  const [evolutions, setEvolutions] = useState<(Evolution|Evolution[])[]>([]);
  const [prevolutions, setPrevolutions] = useState<Evolution[]>([]);

  const { specie, form, isShiny } = instance;
  const { abilities, stats, type } = details;
  const normalAbilities = abilities
    .filter((abilityObj) => !abilityObj.isHidden)
    .map((abilityObj) => abilityObj);
  const hiddenAbility = abilities.find((abilityObj) => abilityObj.isHidden);

  useEffect(() => {
    setEvolutions(nextEvos(specie, form ?? undefined));
    setPrevolutions(prevEvos(specie, form ?? undefined));
  }, [form, specie]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const enableModalClose = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const calculateBST = useCallback(() => stats
    .map((statObj) => statObj.base_stat)
    .reduce((partialBST, curr) => partialBST + curr, 0), [stats]);

  return (
    <Modal
      className="details-modal"
      onClick={enableModalClose}
      onClose={handleClose}
      open={isOpen}
    >
      <Card className="details-card">
        <CardMedia>
          <Link href={`https://pokemondb.net/pokedex/${instance.specie.name.toLowerCase()}`}>
            <img
              alt={instance.fullName.replace(/-em$/, '-!').replace(/-qm$/, '-?')}
              className="details-img"
              src={imageUrl(instance.fullName, isShiny)}
            />
          </Link>
        </CardMedia>
        <CardContent className="details-content">
          <Typography variant="h5">
            {instance.fullName.replace(/-em$/, '-!').replace(/-qm$/, '-?')}
            {isShiny && (
            <span>
            &nbsp;
              <StarRounded fontSize="small" />
            </span>
            )}
          </Typography>
          <Typography variant="h5">
            {`#${specie.dexNo.padStart(3, '0')} (Gen ${getGeneration(specie.dexNo)})`}
          </Typography>
          <Typography className="details-typing">
            Type:&nbsp;
            {type.split(' ').map((currentType, index) => {
              const formattedName = _.startCase(currentType);

              return (
                <>
                  {index === 1 && <>&nbsp;/&nbsp;</>}
                  <Link
                    key={uuid()}
                    href={`https://bulbapedia.bulbagarden.net/wiki/${formattedName}_(type)`}
                  >
                    <TypeIcon type={currentType as PokemonType} />
                  </Link>
                </>
              );
            })}
          </Typography>
          <Typography>
            Abilities:&nbsp;
            {normalAbilities
              .map((ability, index) => {
                const formattedName = _.startCase(ability.name)
                  .replace('Soul Heart', 'Soul-Heart')
                  .replace(/As One.*/, 'As One');

                return (
                  <>
                    {index === 1 && ' / '}
                    <Tooltip arrow disableInteractive placement="top" title={ability.flavorText}>
                      <Link
                        key={uuid()}
                        href={`https://bulbapedia.bulbagarden.net/wiki/${
                          formattedName.replace(' ', '_')
                        }_(Ability)`}
                      >
                        {formattedName}
                      </Link>
                    </Tooltip>
                  </>
                );
              })}
          </Typography>
          {hiddenAbility && (
          <Typography>
            Hidden Ability:&nbsp;
            <Tooltip arrow disableInteractive title={hiddenAbility.flavorText}>
              <Link
                href={`https://bulbapedia.bulbagarden.net/wiki/${
                  _.startCase(hiddenAbility.name).replace(' ', '_')
                }_(Ability)`}
              >
                {_.startCase(hiddenAbility.name)}
              </Link>
            </Tooltip>
          </Typography>
          )}
          {stats.map((stat, index) => {
            const { base_stat: baseStat } = stat;
            const statName = STAT_NAMES[index];

            return (
              <Typography key={uuid()}>
                {`${statName}: ${baseStat}`}
              </Typography>
            );
          })}
          <Typography>
            <strong>BST: </strong>
            {calculateBST()}
          </Typography>
          <Typography>
            Evolution line:
          </Typography>
          <div className="evolution-list">
            {prevolutions.map((prevo) => {
              const { specie: prevoSpecie, form: prevoForm } = prevo;
              const name = `${
                prevoSpecie.name
              }${
                prevoForm && prevoForm.name !== 'default' ? `-${prevoForm.name}` : ''
              }`;

              return (
                <>
                  <div key={uuid()}>
                    <CardMedia>
                      <Link href={`https://pokemondb.net/pokedex/${name.toLowerCase()}`}>
                        <img alt={name} className="evolution-img" src={imageUrl(name, isShiny)} />
                      </Link>
                    </CardMedia>
                    {name}
                  </div>
                  <ArrowRightAltRounded />
                </>
              );
            })}
            <div>
              <CardMedia>
                <Link href={`https://pokemondb.net/pokedex/${instance.specie.name.toLowerCase()}`}>
                  <img
                    alt={instance.fullName.replace(/-em$/, '-!').replace(/-qm$/, '-?')}
                    className="evolution-img"
                    src={imageUrl(instance.fullName, isShiny)}
                  />
                </Link>
              </CardMedia>
              {instance.fullName.replace(/-em$/, '-!').replace(/-qm$/, '-?')}
            </div>
            {evolutions.map((evo) => {
              if (Array.isArray(evo)) {
                if (evo.length > 3) {
                  const cols = Math.ceil(evo.length / 3);
                  const arr: Evolution[][] = [];

                  for (let i = 0; i < cols; i += 1) {
                    arr.push(evo.slice(i * 3, i * 3 + 3));
                  }

                  return (
                    arr.map((column, index) => (
                      <>
                        {column.map((splitEvo) => {
                          const { specie: evoSpecie, form: evoForm } = splitEvo;
                          const name = `${
                            evoSpecie.name
                          }${
                            evoForm && evoForm.name !== 'default' ? `-${evoForm.name}` : ''
                          }`;

                          return name === 'MissingNo.'
                            ? (
                              <div key={uuid()} className="MissingNo" />
                            )
                            : (
                              <div key={uuid()} className="evolution-list">
                                {index === 0 && <ArrowRightAltRounded />}
                                <div>
                                  <CardMedia>
                                    <Link
                                      href={`https://pokemondb.net/pokedex/${name.toLowerCase()}`}
                                    >
                                      <img
                                        alt={name}
                                        className="evolution-img"
                                        src={imageUrl(name, isShiny)}
                                      />
                                    </Link>
                                  </CardMedia>
                                  {name}
                                </div>
                              </div>
                            );
                        })}
                      </>
                    ))
                  );
                }

                return (
                  <div>
                    {evo.map((splitEvo) => {
                      const { specie: evoSpecie, form: evoForm } = splitEvo;
                      const name = `${
                        evoSpecie.name
                      }${
                        evoForm && evoForm.name !== 'default' ? `-${evoForm.name}` : ''
                      }`;

                      return name === 'MissingNo.'
                        ? (
                          <div key={uuid()} className="MissingNo" />
                        )
                        : (
                          <div key={uuid()} className="evolution-list">
                            <ArrowRightAltRounded />
                            <div>
                              <CardMedia>
                                <Link href={`https://pokemondb.net/pokedex/${name.toLowerCase()}`}>
                                  <img
                                    alt={name}
                                    className="evolution-img"
                                    src={imageUrl(name, isShiny)}
                                  />
                                </Link>
                              </CardMedia>
                              {name}
                            </div>
                          </div>
                        );
                    })}
                  </div>
                );
              }
              const { specie: evoSpecie, form: evoForm } = evo;
              const name = `${
                evoSpecie.name
              }${
                evoForm && evoForm.name !== 'default' ? `-${evoForm.name}` : ''
              }`;

              return (
                <>
                  <ArrowRightAltRounded />
                  <div>
                    <CardMedia>
                      <Link href={`https://pokemondb.net/pokedex/${name.toLowerCase()}`}>
                        <img alt={name} className="evolution-img" src={imageUrl(name, isShiny)} />
                      </Link>
                    </CardMedia>
                    {name}
                  </div>
                </>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default DetailsModal;
