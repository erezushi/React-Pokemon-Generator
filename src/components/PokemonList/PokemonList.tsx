import random, { Form, Options } from '@erezushi/pokemon-randomizer';
import { Button } from '@mui/material';
import { Chance } from 'chance';
import React, { useState, useEffect, useCallback } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';

import { errorToast, fullName, randomArrayEntry } from '../../utils';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { IPokemonInstance } from '../../utils/Types';
import ExportModal from '../ExportModal';
import PokemonCard from '../PokemonCard';

import './PokemonList.css';

const chance = new Chance();

const PokemonList = () => {
  const [monList, setMonList] = useState<IPokemonInstance[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const randomize = useCallback(async (opt: Options, shinyChance: number) => {
    try {
      const results = await random(opt);

      setMonList(results.map((specie) => {
        const isShiny = chance.integer({ min: 0, max: 99 }) < shinyChance;
        let form: Form | null = null;
        if (specie.forms) {
          form = randomArrayEntry(specie.forms);
        }

        return ({
          specie,
          form,
          fullName: fullName(specie, form, isShiny),
          isShiny,
        });
      }));
    } catch (err: any) {
      errorToast.fire({
        html: `Couldn't generate Pokémon<br />${err.message}`,
      });
    }
  }, []);

  useEffect(() => {
    eventEmitter.on(generate, randomize);

    return () => {
      eventEmitter.off(generate, randomize);
    };
  }, [randomize]);

  const handleExport = useCallback(() => {
    setModalOpen(true);
  }, []);

  const createCard = useCallback(
    (index: number) => <PokemonCard instance={monList[index]} />,
    [monList],
  );

  return (
    <div className="pokemon-list">
      {monList.length > 0
      && (
        <Button
          className="showdown-export"
          color="primary"
          onClick={handleExport}
          variant="contained"
        >
          Export to &apos;Showdown!&apos;
        </Button>
      )}
      <VirtuosoGrid
        itemContent={(index) => createCard(index)}
        listClassName="list-virtualizer"
        overscan={500}
        totalCount={monList.length}
        useWindowScroll
      />
      {monList.length > 0
      && (
        <ExportModal
          isOpen={isModalOpen}
          pokemonList={monList}
          setOpen={setModalOpen}
        />
      )}
    </div>
  );
};

export default PokemonList;
