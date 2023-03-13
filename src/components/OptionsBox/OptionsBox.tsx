import {
  PokemonType,
  Options,
  getGenerations,
  getTypes,
} from '@erezushi/pokemon-randomizer';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import _ from 'lodash';
import React, {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
} from 'react';

import { CustomCheckbox } from '../../utilComponents';
import { DEFAULT_SETTINGS, errorToast, isType } from '../../utils';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { checkBoxState, ISettings } from '../../utils/Types';

import './OptionsBox.css';

const idMap = {
  Enter: 'generate',
  NumpadEnter: 'generate',
  KeyC: 'reset',
};

const OptionsBox = () => {
  const [typeList, setTypeList] = useState<PokemonType[]>([]);
  const [allGens, setAllGens] = useState<checkBoxState>('checked');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [generationCount, setGenerationCount] = useState(0);

  const setSingleSetting = useCallback((field: keyof ISettings, value: any) => {
    setSettings((prevSettings) => ({ ...prevSettings, [field]: value }));
  }, []);

  const setGenerationList = useCallback(
    (value: Record<string, boolean>
      |((prevGenList: Record<string, boolean>) => Record<string, boolean>)) => {
      if (typeof value === 'function') {
        setSettings((prevSettings) => (
          { ...prevSettings, generationList: value(prevSettings.generationList) }
        ));
      } else {
        setSingleSetting('generationList', value);
      }
    },
    [setSingleSetting],
  );

  const fetchTypes = useCallback(() => {
    const types = getTypes();
    setTypeList(Object.keys(types).sort((a, b) => a.localeCompare(b)) as PokemonType[]);
  }, []);

  const fetchGenerations = useCallback(() => {
    const gens = getGenerations();
    const genNumbers = Object.keys(gens);
    setGenerationCount(genNumbers.length);
    genNumbers.forEach(
      (gen) => setGenerationList((prevGenList) => ({ ...prevGenList, [gen]: true })),
    );
  }, [setGenerationList]);

  useEffect(() => {
    fetchTypes();
    fetchGenerations();

    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const {
        unique,
        forms,
        amount,
        type,
        generationList,
        shinyChance,
        baby,
        basic,
        evolved,
        starter,
        legendary,
        mythical,
      } = JSON.parse(savedSettings) as ISettings;

      setSingleSetting('unique', unique);
      setSingleSetting('forms', forms);
      setSingleSetting('amount', amount);
      setSingleSetting('type', type);
      setSingleSetting('shinyChance', shinyChance);
      setSingleSetting('baby', baby);
      setSingleSetting('basic', basic);
      setSingleSetting('evolved', evolved);
      setSingleSetting('starter', starter);
      setSingleSetting('legendary', legendary);
      setSingleSetting('mythical', mythical);
      setGenerationList((prevList) => ({ ...prevList, ...generationList }));
    }
  }, [fetchGenerations, fetchTypes, setGenerationList, setSingleSetting]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const uniqueClicked = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSingleSetting('unique', event.target.checked),
    [setSingleSetting],
  );

  const changeAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const numberValue = parseInt(value, 10);

    setSingleSetting('amount', numberValue > 0 ? numberValue : 1);
  }, [setSingleSetting]);

  const changeType = useCallback(
    (event: SelectChangeEvent<'all' | PokemonType | 'random'>) => {
      setSingleSetting('type', event.target.value);
    },
    [setSingleSetting],
  );

  const allBoxClicked = useCallback(() => {
    const genListCopy = { ...settings.generationList };
    Object.keys(genListCopy).forEach((gen) => { genListCopy[gen] = allGens !== 'checked'; });
    setGenerationList(genListCopy);
    setAllGens(allGens === 'checked' ? 'none' : 'checked');
  }, [allGens, setGenerationList, settings.generationList]);

  const genClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setGenerationList((prevGenList) => ({ ...prevGenList, [name]: checked }));
  }, [setGenerationList]);

  useEffect(() => {
    if (Object.values(settings.generationList).every((gen) => gen)) {
      setAllGens('checked');
    } else if (Object.values(settings.generationList).some((gen) => gen)) {
      setAllGens('indeterminate');
    } else {
      setAllGens('none');
    }
  }, [settings.generationList]);

  const babyClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('baby', checked);

    if (checked) {
      setSingleSetting('basic', false);
      setSingleSetting('evolved', false);
    }
  }, [setSingleSetting]);

  const basicClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('basic', checked);

    if (checked) {
      setSingleSetting('baby', false);
    }
  }, [setSingleSetting]);

  const evolvedClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('evolved', checked);

    if (checked) {
      setSingleSetting('baby', false);
    }
  }, [setSingleSetting]);

  const starterClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('starter', checked);

    if (checked) {
      setSingleSetting('legendary', false);
      setSingleSetting('mythical', false);
    }
  }, [setSingleSetting]);

  const legendaryClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('legendary', checked);

    if (checked) {
      setSingleSetting('starter', false);
      setSingleSetting('mythical', false);
    }
  }, [setSingleSetting]);

  const mythicalClicked = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setSingleSetting('mythical', checked);

    if (checked) {
      setSingleSetting('starter', false);
      setSingleSetting('legendary', false);
    }
  }, [setSingleSetting]);

  const formsClicked = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSingleSetting('forms', event.target.checked),
    [setSingleSetting],
  );

  const changeShinyChance = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value }: {value: string} = event.target;

    const numberValue = parseInt(value, 10);

    if (numberValue < 0) {
      setSingleSetting('shinyChance', 0);
    } else if (numberValue > 100) {
      setSingleSetting('shinyChance', 100);
    } else {
      setSingleSetting('shinyChance', numberValue);
    }
  }, [setSingleSetting]);

  const handleGenerateClick = useCallback(() => {
    const {
      unique,
      forms,
      amount,
      type,
      generationList,
      baby,
      basic,
      evolved,
      starter,
      legendary,
      mythical,
    } = settings;

    const options: Options = {
      unique,
      forms,
      number: amount,
      type: (type !== 'all' && type !== 'random') ? type : undefined,
      randomType: type === 'random',
      generations: Object.keys(generationList).filter((gen) => generationList[gen]),
      baby,
      basic,
      evolved,
      starter,
      legendary,
      mythical,
    };

    eventEmitter.emit(generate, options, settings.shinyChance);
  }, [settings]);

  const handleResetClick = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    fetchGenerations();
  }, [fetchGenerations]);

  const keyboardClick = useCallback((event: KeyboardEvent) => {
    const { code: keyCode } = event;

    if (
      keyCode === 'Enter'
      || keyCode === 'NumpadEnter'
      || (event.shiftKey && keyCode === 'KeyC')
    ) {
      event.preventDefault();
      document.getElementById(idMap[keyCode])!.click();
    }
  }, []);

  const handleExport = useCallback(() => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 4)]));

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'settings.json';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }, [settings]);

  const handleFileReaderLoadEnd = useCallback((readerResult: string) => {
    try {
      const importObject = JSON.parse(readerResult);
      const {
        unique,
        forms,
        amount,
        type,
        generationList,
        shinyChance,
        baby,
        basic,
        evolved,
        starter,
        legendary,
        mythical,
      } = importObject;

      if (_.isBoolean(unique)) {
        setSingleSetting('unique', unique);
      }

      if (_.isBoolean(forms)) {
        setSingleSetting('forms', forms);
      }

      if (_.isNumber(amount) && amount > 0) {
        setSingleSetting('amount', amount);
      }

      if (_.isString(type) && isType(type)) {
        setSingleSetting('type', type);
      }

      if (
        _.isObject(generationList)
        && Object.keys(generationList).length === generationCount
        && Object.entries(generationList).every(
          ([key, value]) => Number(key) > 0 && Number(key) <= generationCount && _.isBoolean(value),
        )
      ) {
        setSingleSetting('generationList', generationList);
      }

      if (_.isNumber(shinyChance) && shinyChance >= 0 && shinyChance <= 100) {
        setSingleSetting('shinyChance', shinyChance);
      }

      if (_.isBoolean(baby)) {
        setSingleSetting('baby', baby);
      }

      if (_.isBoolean(basic)) {
        setSingleSetting('basic', basic);
      }

      if (_.isBoolean(evolved)) {
        setSingleSetting('evolved', evolved);
      }

      if (_.isBoolean(starter)) {
        setSingleSetting('starter', starter);
      }

      if (_.isBoolean(legendary)) {
        setSingleSetting('legendary', legendary);
      }

      if (_.isBoolean(mythical)) {
        setSingleSetting('mythical', mythical);
      }
    } catch (error: unknown) {
      errorToast.fire(
        'Failed to parse',
        "Couldn't parse file text.\nMake sure to select a JSON file",
      );
    }
  }, [generationCount, setSingleSetting]);

  const handleExportFileChange = useCallback((event: Event) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFileReaderLoadEnd(reader.result as string);
    };
    reader.readAsText((event.target as HTMLInputElement).files![0]);
  }, [handleFileReaderLoadEnd]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    input.onchange = handleExportFileChange;

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [handleExportFileChange]);

  useEffect(() => {
    document.addEventListener('keydown', keyboardClick);

    return () => {
      document.removeEventListener('keydown', keyboardClick);
    };
  }, [keyboardClick]);

  return (
    <Paper className="options-box">
      <Typography component="h2" variant="h5">
        Options
      </Typography>
      <div className="options-row">
        <FormControl className="options-control">
          <FormHelperText>Unique</FormHelperText>
          <CustomCheckbox checked={settings.unique} onChange={uniqueClicked} />
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Forms</FormHelperText>
          <CustomCheckbox checked={settings.forms} onChange={formsClicked} />
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Amount</FormHelperText>
          <TextField
            className="input-field"
            onChange={changeAmount}
            type="number"
            value={settings.amount}
            variant="outlined"
          />
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Type</FormHelperText>
          <Select
            className="input-field"
            onChange={changeType}
            value={settings.type}
            variant="outlined"
          >
            <MenuItem value="all">All</MenuItem>
            {
          typeList.map(
            (listType) => (
              <MenuItem
                key={listType}
                value={listType}
              >
                {_.capitalize(listType)}
              </MenuItem>
            ),
          )
          }
            <MenuItem value="random">Random</MenuItem>
          </Select>
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Generations</FormHelperText>
          <FormGroup row>
            <FormControlLabel
              className="gen-checkbox"
              control={(
                <CustomCheckbox
                  checked={allGens === 'checked'}
                  indeterminate={allGens === 'indeterminate'}
                  onChange={allBoxClicked}
                />
              )}
              label="All"
              labelPlacement="bottom"
            />
            {Object.keys(settings.generationList).map((gen) => (
              <FormControlLabel
                key={gen}
                className="gen-checkbox"
                control={(
                  <CustomCheckbox
                    checked={settings.generationList[gen]}
                    name={gen}
                    onChange={genClicked}
                  />
                )}
                label={gen}
                labelPlacement="bottom"
              />
            ))}
          </FormGroup>
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Shiny Chance (%)</FormHelperText>
          <TextField
            className="input-field"
            onChange={changeShinyChance}
            type="number"
            value={settings.shinyChance}
            variant="outlined"
          />
        </FormControl>
      </div>
      <div className="options-row">
        <FormControl className="options-control">
          <FormHelperText>Evolution Stage</FormHelperText>
          <FormControlLabel
            control={<CustomCheckbox checked={settings.baby} onChange={babyClicked} />}
            label="Baby"
          />
          <FormControlLabel
            control={<CustomCheckbox checked={settings.basic} onChange={basicClicked} />}
            label="Basic"
          />
          <FormControlLabel
            control={<CustomCheckbox checked={settings.evolved} onChange={evolvedClicked} />}
            label="Fully Evolved"
          />
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Status</FormHelperText>
          <FormControlLabel
            control={<CustomCheckbox checked={settings.starter} onChange={starterClicked} />}
            label="Starter"
          />
          <FormControlLabel
            control={<CustomCheckbox checked={settings.legendary} onChange={legendaryClicked} />}
            label="Legendary/Mythical"
          />
          <FormControlLabel
            control={<CustomCheckbox checked={settings.mythical} onChange={mythicalClicked} />}
            label="Mythical"
          />
        </FormControl>
      </div>
      <div className="buttons-row">
        <Button
          className="options-button"
          id="generate"
          onClick={handleGenerateClick}
          size="large"
          variant="outlined"
        >
          Generate
        </Button>
        <Button
          className="options-button"
          color="error"
          id="reset"
          onClick={handleResetClick}
          size="large"
          variant="text"
        >
          Reset Options
        </Button>
        <IconButton onClick={handleExport}>
          <Tooltip title="export settings">
            <DownloadIcon />
          </Tooltip>
        </IconButton>
        <IconButton onClick={handleImport}>
          <Tooltip title="import settings">
            <UploadIcon />
          </Tooltip>
        </IconButton>
      </div>
    </Paper>
  );
};

export default OptionsBox;
