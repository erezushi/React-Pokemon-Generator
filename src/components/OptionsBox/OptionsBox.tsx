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
  TextField,
  Typography,
} from '@material-ui/core';
import _ from 'lodash';
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys-ce';

import CustomCheckbox from '../../utilComponents/CustomCheckbox';
import eventEmitter, { generate } from '../../utils/EventEmitter';
import { IGenList } from '../../utils/Types';

import './OptionsBox.css';

const keyMap = {
  generate: 'Enter',
};

const OptionsBox: React.FC = () => {
  const [unique, setUnique] = useState(true);
  const [forms, setForms] = useState(true);
  const [amount, setAmount] = useState(6);
  const [typeList, setTypeList] = useState<Types[]>([]);
  const [type, setType] = useState<'all' | Types | 'random'>('all');
  const [allGens, setAllGens] = useState('checked');
  const [shinyChance, setShinyChance] = useState(0);
  const [generationList, setGenerationList] = useState<IGenList>({});
  const [baby, setBaby] = useState(false);
  const [basic, setBasic] = useState(false);
  const [evolved, setEvolved] = useState(false);
  const [starter, setStarter] = useState(false);
  const [legendary, setLegendary] = useState(false);
  const [mythical, setMythical] = useState(false);

  const fetchTypes = useCallback(async () => {
    const types = await getTypes();
    setTypeList(Object.keys(types).sort((a, b) => a.localeCompare(b)) as Types[]);
  }, []);

  const fetchGenerations = useCallback(async () => {
    const gens = await getGenerations();
    Object.keys(gens)
      .forEach((gen) => setGenerationList((prevGenList) => ({ ...prevGenList, [gen]: true })));
  }, []);

  useEffect(() => {
    fetchTypes();
    fetchGenerations();
  }, [fetchGenerations, fetchTypes]);

  const uniqueClicked = useCallback((event) => setUnique(event.target.checked), []);

  const changeAmount = useCallback((event) => {
    const { value } = event.target;

    if (value > 0) {
      setAmount(value);
    } else {
      setAmount(1);
    }
  }, []);

  const changeType = useCallback((event) => setType(event.target.value), []);

  const allBoxClicked = useCallback(() => {
    const genListCopy = { ...generationList };
    Object.keys(genListCopy).forEach((gen) => { genListCopy[gen] = allGens !== 'checked'; });
    setGenerationList(genListCopy);
    setAllGens(allGens === 'checked' ? 'none' : 'checked');
  }, [allGens, generationList]);

  const genClicked = useCallback((event) => {
    const { name, checked } = event.target;

    setGenerationList({ ...generationList, [name]: checked });
  }, [generationList]);

  useEffect(() => {
    if (Object.values(generationList).every((gen) => gen)) {
      setAllGens('checked');
    } else if (Object.values(generationList).some((gen) => gen)) {
      setAllGens('indeterminate');
    } else {
      setAllGens('none');
    }
  }, [generationList]);

  const babyClicked = useCallback((event) => {
    const { checked } = event.target;

    setBaby(checked);

    if (checked) {
      setBasic(false);
      setEvolved(false);
    }
  }, []);

  const basicClicked = useCallback((event) => {
    const { checked } = event.target;

    setBasic(checked);

    if (checked) {
      setBaby(false);
    }
  }, []);

  const evolvedClicked = useCallback((event) => {
    const { checked } = event.target;

    setEvolved(checked);

    if (checked) {
      setBaby(false);
    }
  }, []);

  const starterClicked = useCallback((event) => {
    const { checked } = event.target;

    setStarter(checked);

    if (checked) {
      setLegendary(false);
      setMythical(false);
    }
  }, []);

  const legendaryClicked = useCallback((event) => {
    const { checked } = event.target;

    setLegendary(checked);

    if (checked) {
      setStarter(false);
      setMythical(false);
    }
  }, []);

  const mythicalClicked = useCallback((event) => {
    const { checked } = event.target;

    setMythical(checked);

    if (checked) {
      setStarter(false);
      setLegendary(false);
    }
  }, []);

  const formsClicked = useCallback((event) => setForms(event.target.checked), []);

  const changeShinyChance = useCallback((event) => {
    const { value }: {value: string} = event.target;

    const numberValue = parseInt(value, 10);

    if (numberValue < 0) {
      setShinyChance(0);
    } else if (numberValue > 100) {
      setShinyChance(100);
    } else {
      setShinyChance(numberValue);
    }
  }, [setShinyChance]);

  const generateClick = useCallback(() => {
    const options: Options = {
      unique,
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
      forms,
    };

    eventEmitter.emit(generate, options, shinyChance);
  }, [
    amount,
    baby,
    basic,
    evolved,
    forms,
    generationList,
    legendary,
    mythical,
    shinyChance,
    starter,
    type,
    unique,
  ]);

  const handlePress = useCallback((event) => {
    event.preventDefault();

    document.getElementById('generate')!.click();
  }, []);

  const handlers = useMemo(() => ({
    generate: handlePress,
  }), [handlePress]);

  return (
    <div>
      <GlobalHotKeys handlers={handlers} keyMap={keyMap} />
      <Paper className="options-box">
        <Typography component="h2" variant="h5">
          Options
        </Typography>
        <div className="options-row">
          <FormControl className="options-control">
            <FormHelperText>Forms</FormHelperText>
            <CustomCheckbox checked={forms} onChange={formsClicked} />
          </FormControl>
          <FormControl className="options-control">
            <FormHelperText>Unique</FormHelperText>
            <CustomCheckbox checked={unique} onChange={uniqueClicked} />
          </FormControl>
          <FormControl className="options-control">
            <FormHelperText>Amount</FormHelperText>
            <TextField
              className="input-field"
              onChange={changeAmount}
              type="number"
              value={amount}
              variant="outlined"
            />
          </FormControl>
          <FormControl className="options-control">
            <FormHelperText>Type</FormHelperText>
            <Select
              className="input-field"
              onChange={changeType}
              value={type}
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
              {Object.keys(generationList).map((gen) => (
                <FormControlLabel
                  key={gen}
                  className="gen-checkbox"
                  control={(
                    <CustomCheckbox
                      checked={generationList[gen]}
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
              value={shinyChance}
              variant="outlined"
            />
          </FormControl>
        </div>
        <div className="options-row">
          <FormControl className="options-control">
            <FormHelperText>Evolution Stage</FormHelperText>
            <FormControlLabel
              control={<CustomCheckbox checked={baby} onChange={babyClicked} />}
              label="Baby"
            />
            <FormControlLabel
              control={<CustomCheckbox checked={basic} onChange={basicClicked} />}
              label="Basic"
            />
            <FormControlLabel
              control={<CustomCheckbox checked={evolved} onChange={evolvedClicked} />}
              label="Fully Evolved"
            />
          </FormControl>
          <FormControl className="options-control">
            <FormHelperText>Status</FormHelperText>
            <FormControlLabel
              control={<CustomCheckbox checked={starter} onChange={starterClicked} />}
              label="Starter"
            />
            <FormControlLabel
              control={<CustomCheckbox checked={legendary} onChange={legendaryClicked} />}
              label="Legendary/Mythical"
            />
            <FormControlLabel
              control={<CustomCheckbox checked={mythical} onChange={mythicalClicked} />}
              label="Mythical"
            />
          </FormControl>
        </div>
        <div className="options-row">
          <Button
            className="generate"
            color="primary"
            id="generate"
            onClick={generateClick}
            size="large"
            variant="outlined"
          >
            Generate
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default OptionsBox;
