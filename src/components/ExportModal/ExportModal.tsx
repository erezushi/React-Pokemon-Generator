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
} from '@mui/material';
import axios from 'axios';
import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import CustomCheckBox from '../../utilComponents/CustomCheckbox';
import { apiUrl, fullName, imageUrl } from '../../utils';
import { IPokemonInstance, IPokemonResponse, IPokemonSpeciesResponse } from '../../utils/Types';

import './ExportModal.css';

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

  useEffect(() => {
    if (isOpen) {
      pokemonList.forEach((pokemon, index) => {
        setIncludedIndices((prevIncluded) => ({ ...prevIncluded, [index]: false }));

        const { specie, isShiny } = pokemon;
        const urls = [
          apiUrl(specie, null),
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
              name: specie.name,
              genderRate,
              gender,
              nickname: '',
              abilityList,
              ability: abilityList[0],
              level: 100,
              isShiny: isShiny ?? false,
            };
            setExportValues((prevValues) => ({ ...prevValues, [index]: defaultValues }));
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

  const exportText = useCallback(() => {
    navigator.clipboard.writeText(
      Object.values(exportValues)
        .filter((pokemon, index) => includedIndices[index])
        .map((pokemon) => `${
          pokemon.nickname === ''
            ? pokemon.name
            : `${pokemon.nickname} (${pokemon.name})`
        }${
          pokemon.gender === 'random'
            ? ''
            : ` (${pokemon.gender[0].toUpperCase()})` // male -> M, female -> F
        }\nLevel: ${
          pokemon.level
        }\nAbility: ${
          _.startCase(pokemon.ability)
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
        <Typography>
          Note! Forms are set to default, you can choose a form in &apos;Showdown!&apos
        </Typography>
        {hasError
        && (
          <Typography>
            <span style={{ color: 'red' }}>
              {errorText}
            </span>
          </Typography>
        )}
        {pokemonList.map((instance, index) => (
          <div
            key={`row_${index}`}
            className="export-row"
          >
            <FormControlLabel
              control={(
                <CustomCheckBox
                  checked={includedIndices[index]}
                  name={index.toString()}
                  onChange={toggleInclusion}
                />
                )}
              label="include?"
              labelPlacement="top"
            />
            <CardMedia>
              <img
                alt={fullName({ ...instance, form: null })}
                className="export-img"
                src={imageUrl(
                  fullName({ ...instance, form: null }),
                  exportValues[index]?.isShiny ?? false,
                )}
              />
            </CardMedia>
            {includedIndices[index]
              && (
                <>
                    {exportValues[index].genderRate >= 0
                    && (
                      <FormControl>
                        <FormLabel>Gender</FormLabel>
                        <RadioGroup
                          name={index.toString()}
                          onChange={handleGenderChange}
                          row
                          value={exportValues[index].gender}
                        >
                          {
                            exportValues[index].genderRate < 8
                              && <FormControlLabel control={<Radio />} label="Male" value="male" />
                          }
                          {
                            exportValues[index].genderRate > 0
                              && (
                                <FormControlLabel
                                  control={<Radio />}
                                  label="Female"
                                  value="female"
                                />
                              )
                          }
                          {
                            exportValues[index].genderRate < 8 && exportValues[index].genderRate > 0
                              && (
                                <FormControlLabel
                                  control={<Radio />}
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
                      label="Nickname"
                      name={index.toString()}
                      onChange={handleNicknameChange}
                      value={exportValues[index].nickname}
                      variant="outlined"
                    />
                  </FormControl>
                  <FormControl>
                    <InputLabel id={`ability_${index}`}>Abiliy</InputLabel>
                    <Select
                      className="export-ability"
                      label="Ability"
                      labelId={`ability_${index}`}
                      name={index.toString()}
                      onChange={handleAbilityChange}
                      value={exportValues[index].ability}
                    >
                      {exportValues[index].abilityList.map((abilityName) => (
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
                    <InputLabel id={`level_${index}`}>Level</InputLabel>
                    <OutlinedInput
                      label="Level"
                      name={index.toString()}
                      onChange={handleLevelChange}
                      type="number"
                      value={exportValues[index].level}
                    />
                  </FormControl>
                  <FormControl>
                    <Checkbox
                      checked={exportValues[index].isShiny}
                      checkedIcon={<Star htmlColor="#ee0" />}
                      icon={<StarBorder />}
                      name={index.toString()}
                      onChange={handleShinyChange}
                    />
                  </FormControl>
                </>
              )}
          </div>
        ))}
        <Button className="export-button" onClick={exportText} variant="contained">Export</Button>
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
