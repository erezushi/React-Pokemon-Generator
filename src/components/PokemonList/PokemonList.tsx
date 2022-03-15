import random, { Form, Options } from '@erezushi/pokemon-randomizer';
import { Button } from '@mui/material';
import { Chance } from 'chance';
import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { v4 as uuid } from 'uuid';

import { errorToast, fullName, randomArrayEntry } from '../../utils';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { IPokemonInstance } from '../../utils/Types';
import ExportModal from '../ExportModal';
import PokemonCard from '../PokemonCard';

import './PokemonList.css';

const ROWS_PER_PAGE = 10;
const chance = new Chance();

const PokemonList = () => {
  const [monList, setMonList] = useState<IPokemonInstance[]>([]);
  const [splitArray, setSplitArray] = useState<IPokemonInstance[][]>([]);
  const [loadedRows, setLoadedRows] = useState<IPokemonInstance[][]>([]);
  const [lastRowPos, setLastRowPos] = useState(0);
  const [currentScroll, setCurrentScroll] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);

  const randomize = useCallback(async (opt: Options, shinyChance: number) => {
    try {
      setCurrentScroll(window.scrollY);
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

  useEffect(() => {
    setLoadedRows([]);
    setLastRowPos(0);
    const rows = Math.ceil(monList.length / 3);
    const arr: IPokemonInstance[][] = [];

    for (let i = 0; i < rows; i += 1) {
      arr.push(monList.slice(i * 3, i * 3 + 3));
    }

    setSplitArray(arr);
  }, [monList]);

  const loadMore = useCallback(() => {
    setLoadedRows((currentRows) => currentRows.concat(
      splitArray.slice(lastRowPos, lastRowPos + ROWS_PER_PAGE),
    ));

    setLastRowPos((value) => value + ROWS_PER_PAGE);
  }, [lastRowPos, splitArray]);

  useEffect(() => {
    if (loadedRows.length <= ROWS_PER_PAGE) {
      window.scroll(0, currentScroll);
    }
  }, [currentScroll, loadedRows.length]);

  const handleExport = useCallback(() => {
    setModalOpen(true);
  }, []);

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
      <InfiniteScroll
        hasMore={lastRowPos < splitArray.length}
        loader={<div className="row-loader">loading...</div>}
        loadMore={loadMore}
      >
        {loadedRows.map((row) => (
          <div key={uuid()} className="pokemon-row">
            {row.map((specie) => (
              <PokemonCard key={uuid()} instance={specie} />
            ))}
          </div>
        ))}
      </InfiniteScroll>
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
