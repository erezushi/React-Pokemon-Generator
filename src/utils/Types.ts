import { Form, Pokemon, Types } from '@erezushi/pokemon-randomizer';

export interface IPokemonInstance {
  specie: Pokemon,
  isShiny: boolean,
  form: Form | null,
  fullName: string
}

type pokeApiGeneric = {
    name: string,
    url: string
};

type abilities = {
  ability: pokeApiGeneric,
  is_hidden: boolean,
  slot: number,
}[];

type stats = {
  base_stat: number,
  effort: number,
  stat: pokeApiGeneric
}[];

export interface IPokemonDetails {
  abilities: abilities,
  stats: stats,
  type: string
}

export interface IPokemonResponse {
  abilities: abilities,
  base_experience: number,
  forms: any[],
  game_indices: any[],
  height: number,
  held_items: any[],
  id: number,
  is_default: boolean,
  location_area_encounters: string,
  moves: any[],
  name: string,
  order: number,
  past_types: any[],
  species: any,
  sprites: any,
  stats: stats,
  types: any[],
  weight: number,
}

export interface IPokemonSpeciesResponse {
  base_happiness: number,
  capture_rate: number,
  color: any,
  egg_groups: any[],
  evolution_chain: any,
  evolves_from_species: any | null,
  flavor_text_entries: any[],
  form_descriptions: any[],
  forms_switchable: boolean,
  gender_rate: -1|0|1|2|4|6|7|8,
  genera: any[],
  generation: any,
  growth_rate: any[],
  habitat: any | null,
  has_gender_differences: boolean,
  hatch_counter: number,
  id: number,
  is_baby: boolean,
  is_legendary: boolean,
  is_mythical: boolean,
  name: string,
  names: any[],
  order: number,
  pal_park_encounters: any[],
  pokedex_numbers: any[],
  shape: any,
  varieties: any[]
}

export type checkBoxState = 'checked' | 'indeterminate' | 'none';

export interface ISettings {
  unique: boolean,
  forms: boolean,
  amount: number,
  type: 'all' | Types | 'random',
  generationList: Record<string, boolean>,
  shinyChance: number,
  baby: boolean,
  basic: boolean,
  evolved: boolean,
  starter: boolean,
  legendary: boolean,
  mythical: boolean,
}
