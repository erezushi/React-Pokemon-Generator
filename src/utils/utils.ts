import { Pokemon } from '@erezushi/pokemon-randomizer/dist/types';
import Swal from 'sweetalert2';

// #region imageUrl
const imgReplacements: {[name: string]: string} = {
  'Meowstic-M': 'meowstic-male',
  'Meowstic-F': 'meowstic-female',
  'Indeedee-M': 'indeedee-male',
  'Indeedee-F': 'indeedee-female',
  Urshifu: 'urshifu-single-strike',
  Zacian: 'zacian-hero',
  Zamazenta: 'zamazenta-hero',
};

const imgSpecialStrings = /['.:♀♂é ]|-m$/g;

const imgStringMap: {[match: string]: string} = {
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

// #region apiUrl
type replceFunc = ((match: string) => string)|(() => string)

const apiStringMap = new Map<string | RegExp, replceFunc>([
  // 'Static' functions put into place as TypeScript won't accept a
  // union type for the second parameter of String.Prototype.replace()

  // Single character changes
  [/['.]/g, () => ''],
  [' ', () => '-'],

  // Alolan forms
  ['alolan', () => 'alola'],

  // Galarian forms
  ['galarian', () => 'galar'],

  // Gigantamax forms
  ['gigantamax', () => 'gmax'],

  // Oricorio Meteor form
  ['meteor', () => 'red-meteor'],

  // G-Max Toxtricity
  ['toxtricity-gmax', () => 'toxtricity-amped-gmax'],

  // Flabébé
  [/flabébé-.+/g, () => 'flabebe'],

  // Specific form names not found in the API
  [/-(confined|core|mane|wings)/g, () => ''],

  // Galarian Darmanitan (galar-[form] -> [form]-galar)
  [/galar-.+/g, (match) => match.split('-').reverse().join('-')],

  // Indeedee
  [/(?<=indeedee-).+/g, (match) => {
    if (match === 'f') return 'female';
    return 'male';
  }],

  // Pokémon with consistant stats througout their forms
  [new RegExp(
    [
      '(unown',
      '|burmy|cherrim|shellos|gastrodon|arceus',
      '|unfezant|deerling|sawsbuck|frillish|jellicent|genesect',
      '|vivillon|pyroar|floette|florges|furfrou|meowstic|xerneas',
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

export const apiUrl = (specie: Pokemon, formName: string | null): string => {
  const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  if (formName === null || formName === 'default') {
    return `${baseUrl}/${specie.dexNo}`;
  }
  return `${baseUrl}/${apiName(specie.name, formName)}`;
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
const randomArrayEntry = <Type>(array: Type[]) => array[Math.floor(Math.random() * array.length)];

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

export const shinyReplacements = new Map<RegExp, string>([
  [/Minior-.+-/g, 'Minior-'],
  [/Alcremie-.+-(Cream|Swirl)-/g, 'Alcremie-'],
]);
