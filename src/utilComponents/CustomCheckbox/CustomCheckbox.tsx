import { Checkbox, CheckboxProps } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox } from '@material-ui/icons';
import React from 'react';

const CustomCheckbox: React.FC<CheckboxProps> = ({
  checked,
  indeterminate,
  name,
  onChange,
}: CheckboxProps) => (
  <Checkbox
    checked={checked}
    checkedIcon={<CheckBox fontSize="small" />}
    icon={<CheckBoxOutlineBlank fontSize="small" />}
    indeterminate={indeterminate}
    indeterminateIcon={<IndeterminateCheckBox fontSize="small" />}
    name={name}
    onChange={onChange}
  />
);

export default CustomCheckbox;
