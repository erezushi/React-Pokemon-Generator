import React, { useCallback, useMemo } from 'react';
import { PokemonType } from '@erezushi/pokemon-randomizer';
import ArrowRightAltRounded from '@mui/icons-material/ArrowRightAltRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import { Card, CardContent, CardMedia, Link, Modal, Tooltip, Typography } from '@mui/material';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { TypeIcon, PokemonImage } from '../../utilComponents';
import { Evolution, fullName, getGeneration, nextEvos, prevEvos, STAT_NAMES } from '../../utils';
import { IPokemonDetails, IPokemonInstance } from '../../utils/Types';

import './DetailsModal.css';

interface IDetailsModalProps {
  details: IPokemonDetails;
  instance: IPokemonInstance;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DetailsModal = (props: IDetailsModalProps) => {
  const { details, instance, isOpen, setOpen } = props;
  const { specie, form, isShiny } = instance;
  const { abilities, stats, type } = details;

  const normalAbilities = abilities.filter((abilityObj, index, arr) => {
    if (index > 0 && arr[index - 1].name === abilityObj.name) {
      return false;
    }

    return !abilityObj.isHidden;
  });
  const hiddenAbility = abilities.find((abilityObj) => abilityObj.isHidden);

  const evolutions = useMemo(() => nextEvos(specie, form ?? undefined), [specie, form]);
  const prevolutions = useMemo(() => prevEvos(specie, form ?? undefined), [specie, form]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const enableModalClose = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const calculateBST = useCallback(
    () =>
      stats.map((statObj) => statObj.base_stat).reduce((partialBST, curr) => partialBST + curr, 0),
    [stats]
  );

  return (
    <Modal className="details-modal" onClick={enableModalClose} onClose={handleClose} open={isOpen}>
      <Card className="details-card">
        <CardMedia>
          <PokemonImage className="details-img" instance={instance} isLinking />
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
            {`#${specie.dexNo.toString().padStart(3, '0')} (Gen ${getGeneration(specie.dexNo)})`}
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
            {normalAbilities.map((ability, index) => {
              const formattedName = _.startCase(ability.name)
                .replace('Soul Heart', 'Soul-Heart')
                .replace(/As One.*/, 'As One');

              return (
                <>
                  {index === 1 && ' / '}
                  <Tooltip arrow disableInteractive placement="top" title={ability.flavorText}>
                    <Link
                      key={uuid()}
                      href={`https://bulbapedia.bulbagarden.net/wiki/${formattedName.replace(
                        ' ',
                        '_'
                      )}_(Ability)`}
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
                  href={`https://bulbapedia.bulbagarden.net/wiki/${_.startCase(
                    hiddenAbility.name
                  ).replace(' ', '_')}_(Ability)`}
                >
                  {_.startCase(hiddenAbility.name)}
                </Link>
              </Tooltip>
            </Typography>
          )}
          {stats.map((stat, index) => {
            const { base_stat: baseStat } = stat;
            const statName = STAT_NAMES[index];

            return <Typography key={uuid()}>{`${statName}: ${baseStat}`}</Typography>;
          })}
          <Typography>
            <strong>BST: </strong>
            {calculateBST()}
          </Typography>
          <Typography>Evolution line:</Typography>
          <div className="evolution-list">
            {prevolutions.map((prevo) => {
              const prevoInstance: IPokemonInstance = {
                ...prevo,
                fullName: fullName(prevo.specie, isShiny, prevo.form),
                isShiny
              };

              return (
                <>
                  <div key={uuid()}>
                    <CardMedia>
                      <PokemonImage className="evolution-img" instance={prevoInstance} isLinking />
                    </CardMedia>
                    {prevoInstance.fullName}
                  </div>
                  <ArrowRightAltRounded />
                </>
              );
            })}
            <div>
              <CardMedia>
                <PokemonImage className="evolution-img" instance={instance} isLinking />
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

                  return arr.map((column, index) => (
                    <div key={`column-${column[0].specie.name}`} className="evolution-column">
                      {column.map((splitEvo) => {
                        const { name } = splitEvo.specie;

                        const splitEvoInstance: IPokemonInstance = {
                          ...splitEvo,
                          fullName: fullName(splitEvo.specie, isShiny, splitEvo.form),
                          isShiny
                        };

                        return name === 'MissingNo.' ? (
                          <div key={uuid()} className="MissingNo" />
                        ) : (
                          <div key={uuid()} className="evolution-list">
                            {index === 0 && <ArrowRightAltRounded />}
                            <div>
                              <CardMedia>
                                <PokemonImage
                                  className="evolution-img"
                                  instance={splitEvoInstance}
                                  isLinking
                                />
                              </CardMedia>
                              {splitEvoInstance.fullName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                }

                return (
                  <div key={`evolution-${evo[0].specie.name}`}>
                    {evo.map((splitEvo) => {
                      const { name } = splitEvo.specie;

                      const splitEvoInstance: IPokemonInstance = {
                        ...splitEvo,
                        fullName: fullName(splitEvo.specie, isShiny, splitEvo.form),
                        isShiny
                      };

                      return name === 'MissingNo.' ? (
                        <div key={uuid()} className="MissingNo" />
                      ) : (
                        <div key={uuid()} className="evolution-list">
                          <ArrowRightAltRounded />
                          <div>
                            <CardMedia>
                              <PokemonImage
                                className="evolution-img"
                                instance={splitEvoInstance}
                                isLinking
                              />
                            </CardMedia>
                            {splitEvoInstance.fullName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              const evoInstance: IPokemonInstance = {
                ...evo,
                fullName: fullName(evo.specie, isShiny, evo.form),
                isShiny
              };

              return (
                <>
                  <ArrowRightAltRounded />
                  <div>
                    <CardMedia>
                      <PokemonImage className="evolution-img" instance={evoInstance} isLinking />
                    </CardMedia>
                    {evoInstance.fullName}
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
