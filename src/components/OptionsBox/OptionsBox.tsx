import {
  Types,
  Options,
  getGenerations,
  getTypes,
} from '@erezushi/pokemon-randomizer';
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import _ from 'lodash';
import React, {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
} from 'react';

import { CustomCheckbox } from '../../utilComponents';
import { DEFAULT_SETTINGS } from '../../utils';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { checkBoxState } from '../../utils/Types';

import './OptionsBox.css';

const idMap = {
  Enter: 'generate',
  NumpadEnter: 'generate',
  KeyC: 'reset',
};

const OptionsBox = () => {
  const [typeList, setTypeList] = useState<Types[]>([]);
  const [allGens, setAllGens] = useState<checkBoxState>('checked');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const setSingleSetting = useCallback((field: string, value: any) => {
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

  const fetchTypes = useCallback(async () => {
    const types = getTypes();
    setTypeList(Object.keys(types).sort((a, b) => a.localeCompare(b)) as Types[]);
  }, []);

  const fetchGenerations = useCallback(async () => {
    const gens = getGenerations();
    Object.keys(gens)
      .forEach((gen) => setGenerationList((prevGenList) => ({ ...prevGenList, [gen]: true })));
  }, [setGenerationList]);

  useEffect(() => {
    fetchTypes();
    fetchGenerations();

    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [fetchGenerations, fetchTypes]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const uniqueClicked = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSingleSetting('unique', event.target.checked),
    [setSingleSetting],
  );

  const changeAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (parseInt(value, 10) > 0) {
      setSingleSetting('amount', value);
    } else {
      setSingleSetting('amount', 1);
    }
  }, [setSingleSetting]);

  const changeType = useCallback(
    (event: SelectChangeEvent<'all' | Types | 'random'>) => {
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

  useEffect(() => {
    document.addEventListener('keydown', keyboardClick);

    return () => {
      document.removeEventListener('keydown', keyboardClick);
    };
  }, [keyboardClick]);

  return (
    <div>
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
        </div>
      </Paper>
    </div>
  );
};

export default OptionsBox;
