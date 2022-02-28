/* eslint-disable react/no-array-index-key */
import { Done, Star, StarBorder } from '@mui/icons-material';
import {
  Button,
  Paper,
  CardMedia,
  FormControlLabel,
  Modal,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  Checkbox,
  Pagination,
} from '@mui/material';
import axios from 'axios';
import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import CustomCheckBox from '../../utilComponents/CustomCheckbox';
import { apiUrl, imageUrl, showdownName } from '../../utils';
import { IPokemonInstance, IPokemonResponse, IPokemonSpeciesResponse } from '../../utils/Types';

import './ExportModal.css';

const POKEMON_PER_PAGE = 6;

const pageIndex = (index: number, page: number) => index + (page - 1) * POKEMON_PER_PAGE;

interface IExportModalProps {
    isOpen: boolean,
    pokemonList: IPokemonInstance[],
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface IExportValues {
  name: string,
  genderRate: number,
  gender: 'male' | 'female' | 'random',
  nickname: string,
  abilityList: string[],
  ability: string,
  level: number,
  isShiny: boolean
}

const Exportmodal = ({ isOpen, pokemonList, setOpen }: IExportModalProps) => {
  const [includedIndices, setIncludedIndices] = useState<Record<string, boolean>>({});
  const [exportValues, setExportValues] = useState<Record<string, IExportValues>>({});
  const [hasError, setHasError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [exported, setExported] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (isOpen) {
      pokemonList.forEach((pokemon, index) => {
        setIncludedIndices((prevIncluded) => ({ ...prevIncluded, [index]: false }));

        const { specie, form, isShiny } = pokemon;
        const urls = [
          apiUrl(specie, form?.name ?? null),
          apiUrl(specie, null).replace('pokemon', 'pokemon-species'),
        ];

        Promise.all([
          axios.get<IPokemonResponse>(urls[0]),
          axios.get<IPokemonSpeciesResponse>(urls[1]),
        ])
          .then(([pokemonResponse, pokemonSpeciesResponse]) => {
            const abilityList = pokemonResponse.data.abilities.map(
              (ability) => ability.ability.name,
            );
            const genderRate = pokemonSpeciesResponse.data.gender_rate;

            let gender: 'male' | 'female' | 'random';
            if (genderRate === -1) {
              gender = 'random';
            } else if (genderRate > 4) {
              gender = 'female';
            } else {
              gender = 'male';
            }

            const defaultValues: IExportValues = {
              name: pokemon.fullName,
              genderRate,
              gender,
              nickname: '',
              abilityList,
              ability: abilityList[0],
              level: 100,
              isShiny: isShiny ?? false,
            };
            setExportValues((prevValues) => ({ ...prevValues, [index]: defaultValues }));
            setPageNumber(1);
          })
          .catch(() => {
            setHasError(true);
            setErrorText('Error fetching details. Please try changing the included Pokémon.');
          });
      });
    }
  }, [isOpen, pokemonList]);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggleInclusion = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setHasError(false);
    const { name: index, checked } = event.target;

    setIncludedIndices((prevIndices) => {
      const newIndices = { ...prevIndices, [index]: checked };

      if (checked) {
        if (Object.values(newIndices).filter((value) => value).length <= 6) {
          return newIndices;
        }

        return prevIndices;
      }

      return newIndices;
    });
  }, []);

  const handleGenderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: index, value } = event.target;

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        gender: value as 'male' | 'female' | 'random',
      },
    }));
  }, []);

  const handleNicknameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: index, value } = event.target;

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        nickname: value,
      },
    }));
  }, []);

  const handleAbilityChange = useCallback((event: SelectChangeEvent) => {
    const { name: index, value } = event.target;

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        ability: value,
      },
    }));
  }, []);

  const handleLevelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: index, value } = event.target;

    const level = Number(value);

    if (level > 0 && level <= 100) {
      setExportValues((prevValues) => ({
        ...prevValues,
        [index]: {
          ...prevValues[index],
          level: Number(value),
        },
      }));
    }
  }, []);

  const handleShinyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: index, checked } = event.target;

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        isShiny: checked,
      },
    }));
  }, []);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  }, []);

  const exportText = useCallback(() => {
    navigator.clipboard.writeText(
      Object.values(exportValues)
        .filter((pokemon, index) => includedIndices[index])
        .map((pokemon) => `${
          pokemon.nickname === ''
            ? showdownName(pokemon.name)
            : `${pokemon.nickname} (${showdownName(pokemon.name)})`
        }${
          pokemon.gender === 'random'
            ? ''
            : ` (${pokemon.gender[0].toUpperCase()})` // male -> M, female -> F
        }\nLevel: ${
          pokemon.level
        }\nAbility: ${
          _.startCase(pokemon.ability).replace('Soul Heart', 'Soul-Heart')
        }${
          pokemon.isShiny ? '\nShiny: Yes' : ''
        }`)
        .join('\n\n'),
    )
      .then(() => {
        setExported(true);
        setTimeout(() => {
          setExported(false);
        }, 3000);
      })
      .catch(() => {
        setHasError(true);
        setErrorText('Error copying text to the clipboard. Please try again.');
      });
  }, [exportValues, includedIndices]);

  const openShowdown = useCallback(() => {
    window.open('https://play.pokemonshowdown.com/teambuilder');
  }, []);

  return (
    <Modal
      className="export-modal"
      onClose={closeModal}
      open={isOpen}
    >
      <Paper
        className="export-card"
      >
        <Typography className="export-title" component="h2" variant="h5">
          Export
        </Typography>
        {hasError
        && (
          <Typography>
            <span style={{ color: 'red' }}>
              {errorText}
            </span>
          </Typography>
        )}
        <div className="export-list">
          {pokemonList
            .slice((pageNumber - 1) * POKEMON_PER_PAGE, pageNumber * POKEMON_PER_PAGE)
            .map((instance, index) => (
              <div
                key={`row_${index + (pageNumber - 1) * POKEMON_PER_PAGE}`}
                className="export-row"
              >
                <div className="static-row">
                  <FormControlLabel
                    control={(
                      <CustomCheckBox
                        checked={includedIndices[pageIndex(index, pageNumber)]}
                        name={pageIndex(index, pageNumber).toString()}
                        onChange={toggleInclusion}
                      />
                )}
                    label="include?"
                    labelPlacement="top"
                  />
                  <CardMedia>
                    <img
                      alt={instance.fullName}
                      className="export-img"
                      src={imageUrl(
                        instance.fullName,
                        exportValues[pageIndex(index, pageNumber)]?.isShiny ?? false,
                      )}
                    />
                  </CardMedia>
                </div>
                {exportValues[pageIndex(index, pageNumber)]?.genderRate >= 0
                  && (
                    <FormControl>
                      <FormLabel>Gender</FormLabel>
                      <RadioGroup
                        name={pageIndex(index, pageNumber).toString()}
                        onChange={handleGenderChange}
                        row
                        value={exportValues[pageIndex(index, pageNumber)]?.gender ?? 'random'}
                      >
                        {
                          exportValues[pageIndex(index, pageNumber)]?.genderRate < 8
                            && (
                              <FormControlLabel
                                control={(
                                  <Radio
                                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                                  />
                                )}
                                label="Male"
                                value="male"
                              />
                            )
                        }
                        {
                          exportValues[pageIndex(index, pageNumber)]?.genderRate > 0
                            && (
                              <FormControlLabel
                                control={(
                                  <Radio
                                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                                  />
                                )}
                                label="Female"
                                value="female"
                              />
                            )
                        }
                        {
                          exportValues[pageIndex(index, pageNumber)]?.genderRate < 8
                            && exportValues[pageIndex(index, pageNumber)]?.genderRate > 0
                            && (
                              <FormControlLabel
                                control={(
                                  <Radio
                                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                                  />
                                )}
                                label="Random"
                                value="random"
                              />
                            )
                      }
                      </RadioGroup>
                    </FormControl>
                  )}
                <FormControl>
                  <TextField
                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                    label="Nickname"
                    name={pageIndex(index, pageNumber).toString()}
                    onChange={handleNicknameChange}
                    value={exportValues[pageIndex(index, pageNumber)]?.nickname ?? ''}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl>
                  <InputLabel id={`ability_${pageIndex(index, pageNumber)}`}>
                    Abiliy
                  </InputLabel>
                  <Select
                    className="export-ability"
                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                    label="Ability"
                    labelId={`ability_${pageIndex(index, pageNumber)}`}
                    name={pageIndex(index, pageNumber).toString()}
                    onChange={handleAbilityChange}
                    value={exportValues[pageIndex(index, pageNumber)]?.ability ?? ''}
                  >
                    {exportValues[pageIndex(index, pageNumber)]?.abilityList
                      .map((abilityName) => (
                        <MenuItem
                          key={abilityName}
                          value={abilityName}
                        >
                          {_.startCase(abilityName).replace('Soul Heart', 'Soul-Heart')}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel id={`level_${pageIndex(index, pageNumber)}`}>
                    Level
                  </InputLabel>
                  <OutlinedInput
                    className="level-input"
                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                    label="Level"
                    name={pageIndex(index, pageNumber).toString()}
                    onChange={handleLevelChange}
                    type="number"
                    value={exportValues[pageIndex(index, pageNumber)]?.level ?? 100}
                  />
                </FormControl>
                <FormControl>
                  <Checkbox
                    checked={exportValues[pageIndex(index, pageNumber)]?.isShiny ?? false}
                    checkedIcon={<Star htmlColor="#ee0" />}
                    disabled={!includedIndices[pageIndex(index, pageNumber)]}
                    icon={<StarBorder />}
                    name={pageIndex(index, pageNumber).toString()}
                    onChange={handleShinyChange}
                  />
                </FormControl>
              </div>
            ))}
        </div>
        {pokemonList.length > POKEMON_PER_PAGE && (
        <Pagination
          count={Math.ceil(pokemonList.length / POKEMON_PER_PAGE)}
          onChange={handlePageChange}
          page={pageNumber}
        />
        )}
        <div className="export-actions">
          <Button
            className="export-button"
            color="success"
            onClick={exportText}
            variant="contained"
          >
            Export
          </Button>
          <Button
            className="export-button"
            onClick={openShowdown}
            variant="contained"
          >
            Open &apos;Showdown!&apos;
          </Button>
        </div>
        <br />
        {exported && (
        <span className="export-success">
          <Done />
          Copied to clipboard
        </span>
        )}
      </Paper>
    </Modal>
  );
};

export default Exportmodal;
