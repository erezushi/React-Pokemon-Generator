import {
  getPokemon,
  getGenerations,
  Form,
  Pokemon,
  ListPokemon,
} from '@erezushi/pokemon-randomizer';
import Chance from 'chance';
// @ts-ignore
import { Pokedex } from 'pokeapi-js-wrapper';
import { romanize } from 'romans';
import Swal from 'sweetalert2';

import 'animate.css';
import { ISettings } from './Types';

const chance = new Chance();
const pokeAPI = new Pokedex();

// #region Constants
export const STAT_NAMES = [
  'HP',
  'Attack',
  'Defense',
  'Sp. Atk',
  'Sp. Def',
  'Speed',
];

export const DEFAULT_SETTINGS: ISettings = {
  unique: true,
  forms: true,
  amount: 6,
  type: 'all',
  generationList: {},
  shinyChance: 0,
  baby: false,
  basic: false,
  evolved: false,
  starter: false,
  legendary: false,
  mythical: false,
};
// #endregion

// #region imageUrl
const imgReplacements: Record<string, string> = {
  Combee: 'combee-f',
  'Dialga-Altered': 'dialga',
  'Palkia-Altered': 'palkia',
  'Meowstic-M': 'meowstic-male',
  'Meowstic-F': 'meowstic-female',
  'Indeedee-M': 'indeedee-male',
  'Indeedee-F': 'indeedee-female',
  Urshifu: 'urshifu-single-strike',
  Zacian: 'zacian-hero',
  Zamazenta: 'zamazenta-hero',
  'Basculegion-M': 'basculegion-male',
  'Basculegion-F': 'basculegion-female',
};

const imgSpecialStrings = /['.:♀♂é ]|-m$/g;

const imgStringMap: Record<string, string> = {
  "'": '',
  '.': '',
  ':': '',
  ' ': '-',
  '-m': '',
  '♀': '-f',
  '♂': '-m',
  é: 'e',
};

const imageName = (name: string) => imgReplacements[name]
    ?? name.toLowerCase().replace(imgSpecialStrings, (match) => imgStringMap[match]);

export const imageUrl = (name: string, shiny: boolean): string => (
  `https://img.pokemondb.net/sprites/home/${
    shiny ? 'shiny' : 'normal'
  }/${imageName(shiny ? name.replace(/Alcremie-(?!Gigantamax)/, (match) => {
    const sweet = match.split('-')[1];

    return `alcremie-Ruby-Cream-${sweet}`;
  }) : name)}.png`
);
// #endregion

// #region PokéAPI
type replceFunc = ((match: string) => string)|(() => string)

const apiStringMap = new Map<string | RegExp, replceFunc>([
  /*
    'Static' functions put into place as TypeScript won't accept a
    union type for the second parameter of String.Prototype.replace()
  */

  // Single character changes
  [/['.]/g, () => ''],
  [' ', () => '-'],

  // Regional variants
  ['alolan', () => 'alola'],
  ['galarian', () => 'galar'],
  ['hisuian', () => 'hisui'],

  // Gigantamax forms
  ['gigantamax', () => 'gmax'],

  // Altered Dialga & Palkia
  [/(dialga|palkia)-altered/g, ((match) => match.substring(0, match.indexOf('-')))],

  // Oricorio Meteor form
  ['meteor', () => 'red-meteor'],

  // G-Max Toxtricity
  ['toxtricity-gmax', () => 'toxtricity-amped-gmax'],

  // Flabébé
  [/flabébé-.+/g, () => 'flabebe'],

  // Specific form names not found in the API
  [/-(confined|core|mane|wings|hero)/g, () => ''],

  // Galarian Darmanitan (galar-[form] -> [form]-galar)
  [/galar-.+/g, (match) => match.split('-').reverse().join('-')],

  // Meowstic & Indeedee
  [/(?<=(meowstic|indeedee|basculegion)-).+/g, (match) => {
    if (match === 'f') return 'female';

    return 'male';
  }],

  // Pokémon with consistant stats througout their forms
  [new RegExp(
    [
      '(unown',
      '|burmy|cherrim|shellos|gastrodon|arceus',
      '|unfezant|deerling|sawsbuck|frillish|jellicent|genesect',
      '|vivillon|pyroar|floette|florges|furfrou|xerneas',
      '|silvally',
      '|cramorant|morpeko|zarude)-.+',
    ].join(''),
    'g',
  ),
  (match) => match.substring(0, match.indexOf('-'))],
]);

const apiName = (name: string, formName: string) => {
  const fullName = `${name}-${formName}`;

  let modifiedName = fullName.toLowerCase();

  apiStringMap.forEach((value, key) => {
    modifiedName = modifiedName.replace(key, value);
  });

  return modifiedName;
};

export const apiUrl = (specie: Pokemon, formName: string | null) => {
  const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  if (formName === null || formName === 'default') {
    return `${baseUrl}/${specie.dexNo}`;
  }

  return `${baseUrl}/${apiName(specie.name, formName)}`;
};

export const apiRequest = async <T>(url: string): Promise<T> => {
  const result = await pokeAPI.resource(url);

  return result;
};
// #endregion

// #region ShowdownName
const showdownReplacements: Record<string, string> = {
  Alolan: 'Alola',
  Galrian: 'Galar',
  Hisuian: 'Hisui',
  Gigantamax: 'Gmax',
};

const showdownRemovals = new RegExp(`-(${[
  'M$|F$',
  '|Normal',
  '|Standard|Pirouette',
  '|Blade|Active',
  '|Solo|School|Core|Busted',
  '|Gulping|Gorging|Ice|Noice|Hangry|Hero|Single-Strike|Rider',
].join('')})`, 'g');

export const showdownName = (pokemonName: string) => {
  let name = pokemonName;

  Object.entries(showdownReplacements).forEach(([key, value]) => {
    name = name.replace(key, value);
  });

  name = name.replace(showdownRemovals, '');

  return name;
};
// #endregion

// #region SweetAlert
export const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-start',
  showConfirmButton: false,
  showClass: {
    popup: 'animate__animated animate__slideInLeft',
  },
  hideClass: {
    popup: 'animate__animated animate__slideOutLeft',
  },
});

export const errorToast = Toast.mixin({
  timer: 2500,
  icon: 'error',
});
// #endregion

// #region Alcremie
export const randomArrayEntry = <Type>(array: Type[]) => array[
  chance.integer({ min: 0, max: array.length - 1 })
];

const alcremieCreams = [
  'Vanilla-Cream',
  'Ruby-Cream',
  'Matcha-Cream',
  'Mint-Cream',
  'Lemon-Cream',
  'Salted-Cream',
  'Ruby-Swirl',
  'Caramel-Swirl',
  'Rainbow-Swirl',
];

const alcremieSweets = [
  'Strawberry',
  'Love',
  'Berry',
  'Clover',
  'Flower',
  'Star',
  'Ribbon',
];

export const alcremieForm = (): string => {
  const cream = randomArrayEntry(alcremieCreams);
  const sweet = randomArrayEntry(alcremieSweets);

  return `${cream}-${sweet}`;
};
// #endregion

// #region Evolutions
export interface Evolution {
  specie: ListPokemon|Pokemon,
  form?: Form
}

const missinoNo: Evolution = {
  specie: {
    name: 'MissingNo.',
    type: 'bird normal',
  },
};

const extraEvoForms = ['Mega', 'Primal', 'Ash', 'Gigantamax', 'Eternamax'];

export const nextEvos = (pokemon: ListPokemon|Pokemon, form?: Form): (Evolution|Evolution[])[] => {
  const pokemonList = getPokemon();

  if (pokemon.name === 'Urshifu') {
    return form && !form.name.includes('Gigantamax')
      ? [{
        specie: pokemon,
        form: pokemon.forms?.find((currForm) => currForm.name === `${form.name}-Gigantamax`),
      }]
      : [];
  }

  let evolveTo = form ? form.evolveTo : pokemon.evolveTo;

  if (
    (!form
    || form.name === 'default'
    || form.name === 'Amped'
    || form.name === 'Low-Key')
    && pokemon.forms?.some(
      (currForm) => extraEvoForms.some((extraEvo) => currForm.name.includes(extraEvo)),
    )
  ) {
    const dexNo = Object.keys(pokemonList)
      .find((currDexNo) => pokemonList[currDexNo].name === pokemon.name);
    if (evolveTo !== undefined) {
      evolveTo = `${evolveTo} ${pokemon.forms.filter(
        (currForm) => extraEvoForms.some((extraEvo) => currForm.name.includes(extraEvo)),
      ).map((extraForm) => `${dexNo}-${extraForm.name}`).join(' ')}`;
    } else {
      evolveTo = pokemon.forms.filter(
        (currForm) => extraEvoForms.some((extraEvo) => currForm.name.includes(extraEvo)),
      ).map((extraForm) => `${dexNo}-${extraForm.name}`).join(' ');
    }
  }

  if (evolveTo?.includes(' ')) {
    const evolutions = evolveTo.split(' ').map((evoString) => {
      if (evoString.includes('-')) {
        const evolution = pokemonList[evoString.substring(0, evoString.indexOf('-'))];

        return {
          specie: evolution,
          form: evolution.forms!.find(
            (evoForm) => evoForm.name === evoString.substring(
              evoString.indexOf('-') + 1,
            ),
          ),
        };
      }

      return { specie: pokemonList[evoString] };
    });

    return evolutions.some((evolution) => {
      const { specie, form: evoForm } = evolution;

      const evolutionEvolveTo = evoForm ? evoForm.evolveTo : specie.evolveTo;
      const hasExtraEvos = (!evoForm
        || evoForm.name === 'default'
        || evoForm.name === 'Amped'
        || evoForm.name === 'Low-Key')
        && specie.forms?.some(
          (currForm) => extraEvoForms.some((extraEvo) => currForm.name.includes(extraEvo)),
        );

      return Boolean(evolutionEvolveTo) || hasExtraEvos;
    })
      ? [
        evolutions,
        evolutions
          .map(
            (evolution) => nextEvos(evolution.specie, evolution.form)[0] as Evolution ?? missinoNo,
          ),
      ]
      : [evolutions];
  }

  if (evolveTo) {
    if (evolveTo.includes('-')) {
      const evolution = pokemonList[evolveTo.substring(0, evolveTo.indexOf('-'))];
      const evoForm = evolution.forms!.find(
        (currentForm) => currentForm.name === evolveTo!.substring(evolveTo!.indexOf('-') + 1),
      );

      return [{
        specie: evolution,
        form: evoForm,
      }, ...nextEvos(evolution, evoForm)];
    }
    const evolution = pokemonList[evolveTo];

    return [{ specie: evolution }, ...nextEvos(evolution)];
  }

  return [];
};

const ignoreForms = ['Cherrim', 'Vivllon', 'Aegislash', 'Silvally', 'Toxtricity'];

export const prevEvos = (pokemon: ListPokemon|Pokemon, form?: Form): Evolution[] => {
  const pokemonList = getPokemon();

  if (pokemon.name === 'Urshifu') {
    const prevolutions: Evolution[] = [{ specie: pokemonList['891'] }];

    if (form?.name.includes('Gigantamax')) {
      prevolutions.push({
        specie: pokemon,
        form: pokemon.forms
          ?.find(
            (currForm) => currForm.name === form.name.substring(0, form.name.lastIndexOf('-')),
          ),
      });
    }

    return prevolutions;
  }

  if (form && extraEvoForms.some((extraEvo) => form.name.includes(extraEvo))) {
    const prevoForm = pokemon.forms!.find((currForm) => currForm.name === 'default');

    return [...prevEvos(pokemon, prevoForm), { specie: pokemon, form: prevoForm }];
  }
  const wantedEvoString = `${Object
    .keys(pokemonList)
    .find((dexNo) => pokemonList[dexNo].name === pokemon.name)}${
    form?.name && form.name !== 'default' && !ignoreForms.includes(pokemon.name)
      ? `-${form.name}`
      : ''
  }`;

  let prevoForm: Form | undefined;
  const prevolution = Object.values(pokemonList).find((listMon) => {
    prevoForm = listMon.forms?.find(
      (currForm) => currForm.evolveTo?.split(' ').some(
        (evoString) => evoString === wantedEvoString,
      ),
    );

    if (prevoForm) {
      return true;
    }

    return listMon.evolveTo?.split(' ').some((evoString) => evoString === wantedEvoString);
  });

  return prevolution
    ? [...prevEvos(prevolution, prevoForm), { specie: prevolution, form: prevoForm }]
    : [];
};
// #endregion

// #region fullName
const shinyReplacements = new Map<RegExp, string>([
  [/Minior-.+-/g, 'Minior-'],
  [/Alcremie-.+-(Cream|Swirl)-/g, 'Alcremie-'],
]);

export const fullName = (instance: Pokemon, form: Form | null, isShiny: boolean): string => {
  let name = `${instance.name}${(form && form.name !== 'default') ? `-${form.name}` : ''}`;

  if (instance.name === 'Alcremie' && form?.name === 'default') {
    name = `${name}-${alcremieForm()}`;
  }

  if (isShiny) {
    shinyReplacements.forEach((value, key) => {
      name = name.replace(key, value);
    });
  }

  return name;
};
// #endregion

export const getGeneration = (dexNo: string): string => {
  const number = Number(dexNo);
  const generations = getGenerations();

  return romanize(Number(
    Object
      .keys(generations)
      .find((gen) => number >= generations[gen].first && number <= generations[gen].last),
  ));
};
