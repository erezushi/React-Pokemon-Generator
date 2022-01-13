import { CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox } from '@mui/icons-material';
import { Checkbox, CheckboxProps } from '@mui/material';
import React from 'react';

const CustomCheckbox: React.FC<CheckboxProps> = ({
  checked,
  indeterminate,
  name,
  onChange,
}: CheckboxProps) => (
  <Checkbox
    checked={checked}
    checkedIcon={<CheckBox fontSize="small" style={{ color: 'red' }} />}
    icon={<CheckBoxOutlineBlank fontSize="small" />}
    indeterminate={indeterminate}
    indeterminateIcon={<IndeterminateCheckBox color="action" fontSize="small" />}
    name={name}
    onChange={onChange}
  />
);

export default CustomCheckbox;
