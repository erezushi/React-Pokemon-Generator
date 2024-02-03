import React, { useState, useEffect, useCallback } from 'react';
import random, { Form, Options } from '@erezushi/pokemon-randomizer';
import { Button } from '@mui/material';
import { Chance } from 'chance';
import PokeAPI from 'pokedex-promise-v2';
import { VirtuosoGrid } from 'react-virtuoso';

import { LoadingSnackbar } from '../../utilComponents';
import {
  apiName,
  errorToast,
  fullName,
  randomArrayEntry,
} from '../../utils';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { IExportDetails, IPokemonInstance } from '../../utils/Types';
import ExportModal from '../ExportModal';
import PokemonCard from '../PokemonCard';

import './PokemonList.css';

const chance = new Chance();
const pokeAPI = new PokeAPI();

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState<IPokemonInstance[]>([]);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [exportDetails, setExportDetails] = useState<Record<number, IExportDetails>>({});
  const [isModalOpen, setModalOpen] = useState(false);

  const handleExport = useCallback(async () => {
    if (0 in exportDetails) {
      setModalOpen(true);
    } else {
      setSnackbarOpen(true);

      try {
        const responses = await Promise.all(
          pokemonList.map((pokemon) => {
            const { specie, form } = pokemon;
            const name = apiName(specie, form?.name ?? null);
            const specieName = apiName(specie, null);

            return Promise.all([
              pokeAPI.getPokemonByName(name),
              pokeAPI.getPokemonSpeciesByName(specieName),
            ]);
          }),
        );

        responses.forEach(([pokemon, specie], index) => {
          const abilityList = pokemon.abilities.map(
            (abilityObj) => abilityObj.ability.name,
          );
          const genderRate = specie.gender_rate;

          setExportDetails((prevDetails) => ({
            ...prevDetails, [index]: { abilityList, genderRate },
          }));
        });

        setSnackbarOpen(false);
        setModalOpen(true);
      } catch (error: any) {
        setSnackbarOpen(false);
        errorToast.fire({
          html: `Error fetching details<br />${error.message}`,
        });
      }
    }
  }, [exportDetails, pokemonList]);

  const createCard = useCallback(
    (index: number) => <PokemonCard instance={pokemonList[index]} />,
    [pokemonList],
  );

  const randomize = useCallback((opt: Options, shinyChance: number) => {
    try {
      const results = random(opt);

      setPokemonList(results.map((specie) => {
        const isShiny = chance.integer({ min: 0, max: 99 }) < shinyChance;
        let form: Form | undefined;
        if (specie.forms) {
          form = randomArrayEntry(specie.forms);
        }

        return ({
          specie,
          form,
          fullName: fullName(specie, isShiny, form),
          isShiny,
        });
      }));
    } catch (error: any) {
      errorToast.fire({
        html: `Couldn't generate Pokémon<br />${error.message}`,
      });
    }
  }, []);

  useEffect(() => {
    eventEmitter.on(generate, randomize);

    return () => {
      eventEmitter.off(generate, randomize);
    };
  }, [randomize]);

  useEffect(() => {
    setExportDetails({});
  }, [pokemonList]);

  return (
    <div className="pokemon-list">
      {pokemonList.length > 0
      && (
        <>
          <Button
            className="showdown-export"
            color="primary"
            onClick={handleExport}
            variant="contained"
          >
            Export to &apos;Showdown!&apos;
          </Button>
          <ExportModal
            isOpen={isModalOpen}
            pokemonDetails={exportDetails}
            pokemonList={pokemonList}
            setOpen={setModalOpen}
          />
          <LoadingSnackbar isOpen={isSnackbarOpen} title="'Pokémon Showdown!' Export" />
        </>
      )}
      <VirtuosoGrid
        itemContent={(index) => createCard(index)}
        listClassName="list-virtualizer"
        overscan={500}
        totalCount={pokemonList.length}
        useWindowScroll
      />
    </div>
  );
};

export default PokemonList;
