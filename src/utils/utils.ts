import {
  getPokemon,
  getGenerations,
  Form,
  Pokemon,
  getTypes,
} from '@erezushi/pokemon-randomizer';
import Chance from 'chance';
import Pokedex from 'pokedex-promise-v2';
import { romanize } from 'romans';
import Swal from 'sweetalert2';

import 'animate.css';
import { ICustomListFilters, ISettings } from './Types';

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
  listMode: false,
};

export const DEFAULT_FILTERS: ICustomListFilters = {
  generations: {},
  types: {
    bug: false,
    dark: false,
    dragon: false,
    electric: false,
    fairy: false,
    fighting: false,
    fire: false,
    flying: false,
    ghost: false,
    grass: false,
    ground: false,
    ice: false,
    normal: false,
    poison: false,
    psychic: false,
    rock: false,
    steel: false,
    water: false,
  },
  searchTerm: '',
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
type replacerFunc = ((match: string, ...args: any[]) => string)|(() => string)

const apiStringMap = new Map<string | RegExp, replacerFunc>([
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
  ['paldean', () => 'paldea'],

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

  // Male & Female forms with differing stats
  [/(indeedee|basculegion|oinkologne)-(.+)/g, (_, specie, gender) => {
    if (gender === 'f') return `${specie}-female`;

    return specie === 'oinkologne' ? 'oinkologne' : 'male';
  }],

  // Zacian & Zamazenta Hero forms (not in next group because of Palafin)
  [/(zacian|zamazenta)-hero/g, () => ''],

  // Specific form names not found in the API
  [/-(confined|core|mane|wings|rider|zero|chest)/g, () => ''],

  // Pokémon with consistent stats throughout their forms
  [new RegExp(
    [
      '(unown', // Gen II
      '|burmy|cherrim|shellos|gastrodon|arceus', // Gen IV
      '|unfezant|deerling|sawsbuck|frillish|jellicent|genesect', // Gen V
      '|vivillon|pyroar|floette|florges|furfrou|meowstic|xerneas', // Gen VI
      '|silvally', // Gen VII
      '|cramorant|morpeko|zarude', // Gen VIII
      '|maushold|squawkabilly|tatsugiri|dudunsparce)-.+', // Gen IX
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
  const result = await pokeAPI.getResource(url);

  return result;
};
// #endregion

// #region ShowdownName
const showdownReplacements: Record<string, string> = {
  Alolan: 'Alola',
  Galarian: 'Galar',
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
  specie: Pokemon,
  form?: Form
}

const missingNo: Evolution = {
  specie: {
    name: 'MissingNo.',
    type: 'bird normal',
    dexNo: 0,
  },
};

const extraEvoForms = ['Mega', 'Primal', 'Ash', 'Gigantamax', 'Eternamax'];

export const nextEvos = (pokemon: Pokemon, form?: Form): (Evolution|Evolution[])[] => {
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
        const dexNo = Number(evoString.substring(0, evoString.indexOf('-')));
        const evolution = pokemonList[dexNo];

        return {
          specie: { ...evolution, dexNo } as Pokemon,
          form: evolution.forms!.find(
            (evoForm) => evoForm.name === evoString.substring(
              evoString.indexOf('-') + 1,
            ),
          ),
        };
      }

      return { specie: { ...pokemonList[evoString], dexNo: Number(evoString) } as Pokemon };
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
            (evolution) => nextEvos(evolution.specie, evolution.form)[0] as Evolution ?? missingNo,
          ),
      ]
      : [evolutions];
  }

  if (evolveTo) {
    if (evolveTo.includes('-')) {
      const dexNo = Number(evolveTo.substring(0, evolveTo.indexOf('-')));
      const evolution = { ...pokemonList[dexNo], dexNo } as Pokemon;
      const evoForm = evolution.forms!.find(
        (currentForm) => currentForm.name === evolveTo!.substring(evolveTo!.indexOf('-') + 1),
      );

      return [{
        specie: evolution,
        form: evoForm,
      }, ...nextEvos(evolution, evoForm)];
    }
    const evolution = { ...pokemonList[evolveTo], dexNo: Number(evolveTo) } as Pokemon;

    return [{ specie: evolution }, ...nextEvos(evolution)];
  }

  return [];
};

const ignoreForms = [
  'Cherrim',
  'Vivillon',
  'Aegislash',
  'Silvally',
  'Toxtricity',
  'Maushold',
  'Palafin',
  'Dudunsparce',
];

export const prevEvos = (pokemon: Pokemon, form?: Form): Evolution[] => {
  const pokemonList = getPokemon();

  if (pokemon.name === 'Urshifu') {
    const prevolutions: Evolution[] = [{ specie: { ...pokemonList['891'], dexNo: 891 } }];

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
  const wantedEvoString = `${pokemon.dexNo}${
    form?.name && form.name !== 'default' && !ignoreForms.includes(pokemon.name)
      ? `-${form.name}`
      : ''
  }`;

  let prevoForm: Form | undefined;
  let prevoDexNo = 0;
  const prevolution = Object.entries(pokemonList).find(([dexNo, listMon]) => {
    prevoForm = listMon.forms?.find(
      (currForm) => currForm.evolveTo?.split(' ').some(
        (evoString) => evoString === wantedEvoString,
      ),
    );

    if (prevoForm) {
      prevoDexNo = Number(dexNo);

      return true;
    }

    const isMatching = listMon.evolveTo
      ?.split(' ')
      .some((evoString) => evoString === wantedEvoString);

    if (isMatching) {
      prevoDexNo = Number(dexNo);
    }

    return isMatching;
  });

  return prevolution
    ? [
      ...prevEvos({ ...prevolution[1], dexNo: prevoDexNo }, prevoForm),
      { specie: { ...prevolution[1], dexNo: prevoDexNo }, form: prevoForm },
    ]
    : [];
};
// #endregion

// #region fullName
const shinyReplacements = new Map<RegExp, string>([
  [/Minior-.+-/g, 'Minior-'],
  [/Alcremie-.+-(Cream|Swirl)-/g, 'Alcremie-'],
]);

export const fullName = (specie: Pokemon, isShiny: boolean, form?: Form): string => {
  let name = `${specie.name}${(form && form.name !== 'default') ? `-${form.name}` : ''}`;

  if (specie.name === 'Alcremie' && form?.name === 'default') {
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

// #region Site Links
const siteSpecialChars = /[♂ ♀é]/g;

const siteSpecialCharMap: Record<string, string> = {
  '♂': 'm',
  ' ': '',
  '♀': 'f',
  é: 'e',
};

const pokeDbSpecialChars = /[. ♂♀é:']/g;

const pokeDbSpecialCharMap: Record<string, string> = {
  '.': '',
  ' ': '-',
  '♂': '-m',
  '♀': '-f',
  é: 'e',
  ':': '',
  "'": '',
};

export const siteLinks: Record<string, string> = {
  bulbapedia: 'https://bulbapedia.bulbagarden.net/wiki/_pkmnu__(Pokémon)',
  serebii: 'https://www.serebii.net/pokemon/_pkmnlc_/',
  smogon: 'https://www.smogon.com/dex/ss/pokemon/_pkmnc_/',
  pokeDB: 'https://pokemondb.net/pokedex/_pkmns_/',
};

export const generateLink = (baseLink: string, name: string) => {
  let formattedName = name;

  return baseLink.replace(/_pkmn[clsu]{0,2}_/g, (match) => {
    if (match.includes('c')) {
      formattedName = formattedName
        .replace(siteSpecialChars, (charMatch) => siteSpecialCharMap[charMatch]);
    }

    if (match.includes('l')) {
      formattedName = formattedName.toLocaleLowerCase();
    }

    if (match.includes('s')) {
      formattedName = formattedName
        .replace(pokeDbSpecialChars, (charMatch) => pokeDbSpecialCharMap[charMatch]);
    }

    if (match.includes('u')) {
      formattedName = formattedName.replace(' ', '_');
    }

    return formattedName;
  });
};
// #endregion

// #region General utils
export const getPokedexNumber = (wantedName: string): number => {
  const pokemonList = getPokemon();
  const wantedPokemon = Object.entries(pokemonList)
    .find((entry) => entry[1].name === wantedName);

  return Number(wantedPokemon?.[0]);
};

export const getGeneration = (dexNo: number): string => {
  const generations = getGenerations();

  return romanize(Number(
    Object
      .keys(generations)
      .find((gen) => dexNo >= generations[gen].first && dexNo <= generations[gen].last),
  ));
};

export const isType = (input: string) => {
  const allTypes = Object.keys(getTypes());
  const optionalSettings = [...allTypes, 'all', 'random'];

  return optionalSettings.includes(input);
};
// #endregion
