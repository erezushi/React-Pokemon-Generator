import random, { Form, Options } from '@erezushi/pokemon-randomizer';
import { Chance } from 'chance';
import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { v4 as uuid } from 'uuid';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { IPokemonInstance } from '../../utils/Types';
import { errorToast } from '../../utils/utils';
import PokemonCard from '../PokemonCard';

import './PokemonList.css';

const ROWS_PER_PAGE = 10;
const chance = new Chance();

const PokemonList: React.FC = () => {
  const [monList, setMonList] = useState<IPokemonInstance[]>([]);
  const [splitArray, setSplitArray] = useState<IPokemonInstance[][]>([]);
  const [loadedRows, setLoadedRows] = useState<IPokemonInstance[][]>([]);
  const [lastRowPos, setLastRowPos] = useState(0);
  const [currentScroll, setCurrentScroll] = useState(0);

  const randomize = useCallback(async (opt: Options, shinyChance: number) => {
    try {
      setCurrentScroll(window.scrollY);
      const results = await random(opt);

      setMonList(results.map((instance) => {
        const isShiny = chance.integer({ min: 0, max: 99 }) < shinyChance;
        let form: Form | null = null;
        if (instance.forms) {
          form = instance.forms[chance.integer({ min: 0, max: instance.forms.length - 1 })];
        }

        return ({
          specie: instance,
          isShiny,
          form,
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

  return (
    <div className="pokemon-list">
      <InfiniteScroll
        hasMore={lastRowPos < splitArray.length}
        loader={<div className="row-loader">loading...</div>}
        loadMore={loadMore}
      >
        {loadedRows.map((row) => (
          <div key={uuid()} className="pokemon-row">
            {row.map((instance) => (
              <PokemonCard key={uuid()} instance={instance} />
            ))}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PokemonList;
