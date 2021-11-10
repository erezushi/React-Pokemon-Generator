import { Form, Pokemon } from '@erezushi/pokemon-randomizer/dist/types';

export interface IGenList {
    [id: string]: boolean,
}

export interface IPokemonInstance {
  specie: Pokemon,
  isShiny: boolean,
  form: Form | null,
}

type abilities = {
  ability: {
    name: string,
    url: string
  },
  'is_hidden': boolean,
  slot: number,
}[]

type stats = {
  'base_stat': number,
  effort: number,
  stat: any,
}[]

export interface IPokemonDetails {
  abilities: abilities,
  stats: stats,
  type: string
}

export interface IPokemonResponse {
  data: {
    abilities: abilities,
    'base_experience': number,
    forms: any[],
    'game_indices': any[],
    height: number,
    'held_items': any[],
    id: number,
    'is_default': boolean,
    'location_area_encounters': string,
    moves: any[],
    name: string,
    order: number,
    'past_types': any[],
    species: any,
    sprites: any,
    stats: stats,
    types: any[],
    weight: number,
  }
}
