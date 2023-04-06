import React, { useCallback, useEffect, useState } from 'react';
import { PokemonType, getGenerations, getPokemon } from '@erezushi/pokemon-randomizer';
import { Button, FormControlLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';

import { CustomCheckbox } from '../../utilComponents';
import { DEFAULT_FILTERS, getPokedexNumber } from '../../utils';

import CustomListFilters from './CustomListFilters';

import './CustomList.css';

const generationList = getGenerations();

const CustomList = () => {
  const [fullList, setFullList] = useState<Record<string, boolean>>({});
  const [visibleList, setVisibleList] = useState<Record<string, boolean>>(fullList);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

    setVisibleList((prevVisibleList) => {
      const listCopy = { ...prevVisibleList };

      listCopy[name] = checked;

      return listCopy;
    });
    setFullList((prevFullList) => {
      const listCopy = { ...prevFullList };

      listCopy[name] = checked;

      return listCopy;
    });
  }, []);

  const returnHome = useCallback(() => {
    navigate('/', { state: fullList });
  }, [fullList, navigate]);

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
        fetchGenerations={fetchGenerations}
        filters={filters}
        saveList={returnHome}
        setFilters={setFilters}
      />
      <div className="custom-list-actions">
        <Button className="custom-list-button" onClick={selectAllVisible} variant="contained">
          Select all filtered
        </Button>
        <Button className="custom-list-button" onClick={deselectAllVisible} variant="contained">
          Deselect all filtered
        </Button>
      </div>
      <VirtuosoGrid
        data={Object.values(visibleList)}
        itemContent={(index) => createCheckBox(index)}
        listClassName="list-virtualizer"
        overscan={500}
        useWindowScroll
      />
    </div>
  );
};

export default CustomList;
