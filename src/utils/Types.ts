import { Form, Pokemon, PokemonType } from '@erezushi/pokemon-randomizer';
import { StatElement } from 'pokedex-promise-v2';

export interface IPokemonInstance {
  specie: Pokemon,
  isShiny: boolean,
  form?: Form,
  fullName: string
}

export interface IPokemonDetails {
  abilities: {
    name: string,
    flavorText: string,
    isHidden: boolean
  }[],
  stats: StatElement[],
  type: string
}

export interface IExportDetails {
  genderRate: number,
  abilityList: string[],
}

export type checkBoxState = 'checked' | 'indeterminate' | 'none';

export interface ISettings {
  unique: boolean,
  forms: boolean,
  amount: number,
  type: 'all' | PokemonType | 'random',
  generationList: Record<string, boolean>,
  shinyChance: number,
  baby: boolean,
  basic: boolean,
  evolved: boolean,
  starter: boolean,
  legendary: boolean,
  mythical: boolean,
  listMode: boolean,
}

export interface ICustomListFilters {
  generations: Record<number, boolean>;
  types: Record<PokemonType, boolean>;
  searchTerm: string;
}
