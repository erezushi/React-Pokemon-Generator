import React, { useCallback, useEffect, useState } from 'react';
import { PokemonType, getGenerations, getPokemon } from '@erezushi/pokemon-randomizer';
import { Button, FormControlLabel } from '@mui/material';
import PokeAPI from 'pokedex-promise-v2';
import { useLocation, useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';

import { CustomCheckbox } from '../../utilComponents';
import { DEFAULT_FILTERS, getPokedexNumber } from '../../utils';
import PokedexSelectionModal from '../PokedexSelectionModal';

import CustomListFilters from './CustomListFilters';

import './CustomList.css';

const generationList = getGenerations();
const pokeAPI = new PokeAPI();

const CustomList = () => {
  const [fullList, setFullList] = useState<Record<string, boolean>>({});
  const [visibleList, setVisibleList] = useState<Record<string, boolean>>(fullList);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isPokedexModalOpen, setIsPokedexModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setFullList(location.state);
    setVisibleList(location.state);
  }, [location.state]);

  const fetchGenerations = useCallback(() => {
    Object.keys(generationList).forEach((gen) => {
      setFilters((prevFilters) => {
        const filtersCopy = { ...prevFilters };

        filtersCopy.generations = {
          ...filtersCopy.generations,
          [gen]: false,
        };

        return filtersCopy;
      });
    });
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  useEffect(() => {
    const pokemonList = getPokemon();
    const { generations: generationFilter, types: typeFilter, searchTerm } = filters;

    const isGenerationFilterEmpty = Object.values(generationFilter).every((checked) => !checked);
    const isTypeFilterEmpty = Object.values(typeFilter).every((checked) => !checked);
    const isSearchFilterEmpty = searchTerm === '';

    setVisibleList(
      Object.fromEntries(Object.entries(fullList).filter(([pokemonName], index) => {
        const dexNo = index + 1;

        const generation = Object.keys(generationList).find(
          (gen) => dexNo >= generationList[gen].first && dexNo <= generationList[gen].last,
        );
        const types = pokemonList[dexNo].type.split(' ') as PokemonType[];

        return (isGenerationFilterEmpty || generationFilter[Number(generation)])
          && (isTypeFilterEmpty || types.some((type) => typeFilter[type]))
          && (isSearchFilterEmpty || pokemonName.toLowerCase().includes(searchTerm.toLowerCase()));
      })),
    );
  }, [filters, fullList]);

  const selectAllVisible = useCallback(() => {
    setVisibleList((prevVisibleList) => {
      const listCopy = { ...prevVisibleList };

      Object.keys(listCopy).forEach((pokemonName) => {
        listCopy[pokemonName] = true;
      });

      setFullList((prevFullList) => ({
        ...prevFullList,
        ...listCopy,
      }));

      return listCopy;
    });
  }, []);

  const deselectAllVisible = useCallback(() => {
    setVisibleList((prevVisibleList) => {
      const listCopy = { ...prevVisibleList };

      Object.keys(listCopy).forEach((pokemonName) => {
        listCopy[pokemonName] = false;
      });

      setFullList((prevFullList) => ({
        ...prevFullList,
        ...listCopy,
      }));

      return listCopy;
    });
  }, []);

  const changeSinglePokemon = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFullList((prevFullList) => {
      const listCopy = { ...prevFullList };

      listCopy[name] = checked;

      return listCopy;
    });
  }, []);

  const returnHome = useCallback(() => {
    navigate('/', { state: fullList });
  }, [fullList, navigate]);

  const handleExport = useCallback(() => {
    const textList = Object.keys(fullList).filter((name) => fullList[name]).join('\n');

    const url = URL.createObjectURL(new Blob([textList]));

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Custom List.txt';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }, [fullList]);

  const handleFileReaderLoadEnd = useCallback((readerResult: string) => {
    const importedList = readerResult.split('\n');

    setFullList((prevFullList) => {
      const fullListCopy = { ...prevFullList };

      return Object.fromEntries(
        Object.entries(fullListCopy).map(([name]) => [
          name,
          importedList.includes(name),
        ]),
      );
    });
  }, []);

  const handleExportFileChange = useCallback((event: Event) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFileReaderLoadEnd(reader.result as string);
    };
    reader.readAsText((event.target as HTMLInputElement).files![0]);
  }, [handleFileReaderLoadEnd]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.style.display = 'none';
    input.onchange = handleExportFileChange;

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [handleExportFileChange]);

  const openPokedexModal = useCallback(() => {
    setIsPokedexModalOpen(true);
  }, []);

  const selectPokedex = useCallback(async (pokedex: string) => {
    let natDexNumbers: string[] = [];

    const pokedexResponses = await Promise.all(
      pokedex
        .split(' ')
        .map((pokedexPart) => pokeAPI.getPokedexByName(pokedexPart)),
    );

    pokedexResponses.forEach((response) => {
      natDexNumbers = natDexNumbers.concat(
        response.pokemon_entries.map(
          (pokemon) => pokemon.pokemon_species.url.split('/').at(-2) ?? '',
        ),
      );
    });

    setFullList((prevFullList) => {
      const fullListCopy = { ...prevFullList };

      return Object.fromEntries(
        Object.entries(fullListCopy).map(([name], index) => [
          name,
          natDexNumbers.includes((index + 1).toString()),
        ]),
      );
    });

    setIsPokedexModalOpen(false);
  }, []);

  const createCheckBox = useCallback((index: number) => {
    const [pokemonName, isSelected] = Object.entries(visibleList)[index];
    const dexNo = getPokedexNumber(pokemonName);

    return (
      <FormControlLabel
        key={pokemonName}
        className="custom-list-pokemon"
        control={(
          <CustomCheckbox
            checked={isSelected}
            name={pokemonName}
            onChange={changeSinglePokemon}
          />
      )}
        label={(
          <div className="custom-list-label">
            <img
              alt="Pokemon Sprite"
              src={
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                  dexNo
                }.png`
              }
            />
            <br />
            {pokemonName}
          </div>
        )}
        labelPlacement="bottom"
      />
    );
  }, [changeSinglePokemon, visibleList]);

  return (
    <div className="custom-list-container">
      <CustomListFilters
        exportList={handleExport}
        fetchGenerations={fetchGenerations}
        filters={filters}
        importList={handleImport}
        saveList={returnHome}
        setFilters={setFilters}
      />
      <div className="custom-list-actions">
        <Button
          className="custom-list-button"
          onClick={selectAllVisible}
          variant="contained"
        >
          Select all filtered
        </Button>
        <Button
          className="custom-list-button"
          onClick={deselectAllVisible}
          variant="contained"
        >
          Deselect all filtered
        </Button>
        <Button
          className="custom-list-button"
          onClick={openPokedexModal}
          variant="contained"
        >
          Select Pokédex
        </Button>
      </div>
      <VirtuosoGrid
        data={Object.values(visibleList)}
        itemContent={(index) => createCheckBox(index)}
        listClassName="list-virtualizer"
        overscan={500}
        useWindowScroll
      />
      <PokedexSelectionModal
        isOpen={isPokedexModalOpen}
        selectPokedex={selectPokedex}
        setOpen={setIsPokedexModalOpen}
      />
    </div>
  );
};

export default CustomList;
