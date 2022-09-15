import { Form, Pokemon, PokemonType } from '@erezushi/pokemon-randomizer';
import { StatElement } from 'pokedex-promise-v2';

export interface IPokemonInstance {
  specie: Pokemon,
  isShiny: boolean,
  form: Form | null,
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
}
