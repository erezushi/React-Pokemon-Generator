/* eslint-disable react/no-array-index-key */
import React, {
  useCallback,
  useEffect,
  useState
} from 'react';
import Done from '@mui/icons-material/Done';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
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
  Pagination
} from '@mui/material';
import _ from 'lodash';

import { CustomCheckbox, PokemonImage } from '../../utilComponents';
import { showdownName } from '../../utils';
import { IExportDetails, IPokemonInstance } from '../../utils/Types';

import './ExportModal.css';

const POKEMON_PER_PAGE = 6;

const pageIndex = (index: number, page: number) => index + (page - 1) * POKEMON_PER_PAGE;

interface IExportValues {
  name: string,
  gender: 'male' | 'female' | 'random',
  nickname: string,
  ability: string,
  level: number,
  isShiny: boolean
}

interface IExportModalProps {
    isOpen: boolean,
    pokemonDetails: Record<number, IExportDetails>,
    pokemonList: IPokemonInstance[],
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Exportmodal = (props: IExportModalProps) => {
  const {
    isOpen, pokemonDetails, pokemonList, setOpen
  } = props;

  const [includedIndices, setIncludedIndices] = useState<Record<number, boolean>>({});
  const [exportValues, setExportValues] = useState<Record<number, IExportValues>>({});
  const [hasError, setHasError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [exported, setExported] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (isOpen) {
      pokemonList.forEach((pokemon, index) => {
        setIncludedIndices((prevIncluded) => ({ ...prevIncluded, [index]: false }));

        const { isShiny } = pokemon;

        const { abilityList, genderRate } = pokemonDetails[index];

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
          gender,
          nickname: '',
          ability: abilityList[0],
          level: 100,
          isShiny: isShiny ?? false
        };
        setExportValues((prevValues) => ({ ...prevValues, [index]: defaultValues }));
        setPageNumber(1);
      });
    }
  }, [isOpen, pokemonDetails, pokemonList]);

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
    const { name, value } = event.target;

    const index = Number(name);

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        gender: value as 'male' | 'female' | 'random'
      }
    }));
  }, []);

  const handleNicknameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const index = Number(name);

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        nickname: value
      }
    }));
  }, []);

  const handleAbilityChange = useCallback((event: SelectChangeEvent) => {
    const { name, value } = event.target;

    const index = Number(name);

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        ability: value
      }
    }));
  }, []);

  const handleLevelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const index = Number(name);
    const level = Number(value);

    if (level > 0 && level <= 100) {
      setExportValues((prevValues) => ({
        ...prevValues,
        [index]: {
          ...prevValues[index],
          level: Number(value)
        }
      }));
    }
  }, []);

  const handleShinyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    const index = Number(name);

    setExportValues((prevValues) => ({
      ...prevValues,
      [index]: {
        ...prevValues[index],
        isShiny: checked
      }
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
        .join('\n\n')
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
                      <CustomCheckbox
                        checked={includedIndices[pageIndex(index, pageNumber)]}
                        name={pageIndex(index, pageNumber).toString()}
                        onChange={toggleInclusion}
                      />
                )}
                    label="include?"
                    labelPlacement="top"
                  />
                  <CardMedia>
                    <PokemonImage
                      className="export-img"
                      instance={{
                        ...instance,
                        isShiny: exportValues[index + (pageNumber - 1) * POKEMON_PER_PAGE]?.isShiny
                      }}
                      isLinking
                    />
                  </CardMedia>
                </div>
                {pokemonDetails[pageIndex(index, pageNumber)]?.genderRate >= 0
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
                          pokemonDetails[pageIndex(index, pageNumber)]?.genderRate < 8
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
                          pokemonDetails[pageIndex(index, pageNumber)]?.genderRate > 0
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
                          pokemonDetails[pageIndex(index, pageNumber)]?.genderRate < 8
                            && pokemonDetails[pageIndex(index, pageNumber)]?.genderRate > 0
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
                    {pokemonDetails[pageIndex(index, pageNumber)]?.abilityList
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
