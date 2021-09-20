import { Form, Pokemon } from '@erezushi/pokemon-randomizer/dist/types';

export interface IGenList {
    [id: string]: boolean
}

export interface IPokemonInstance {
  specie: Pokemon,
  isShiny: boolean,
  form: Form | null
}

export interface IPokemonResponse {
  data: {
    abilities: any[],
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
    stats: {
      'base_stat': number,
      effort: number,
      stat: any
    }[],
    types: any[],
    weight: number,
  }
}
