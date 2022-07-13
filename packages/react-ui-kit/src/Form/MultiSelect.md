Demo:

```js
import {Fragment, useState} from 'react';
import {Columns, Column, ErrorMessage, MultiSelect} from '@wireapp/react-ui-kit';

const multiSelectOptions = [
  {value: '1', label: 'Option 1 long long long long name'},
  {value: '2', label: 'Option 2 longest name'},
  {value: '3', label: 'Option 3'},
  {value: '4', label: 'Option 4', isDisabled: true},
  {value: '5', label: 'Option 5'},
  {value: '6', label: 'Option 6'},
];

const [firstMultiSelectOption, setFirstMultiSelectOption] = useState([multiSelectOptions[0]]);

<Fragment>
  <Columns>
    <Column>Multi select</Column>

    <Column>
      <MultiSelect
        label="Select"
        id="firstMultiSelect"
        options={multiSelectOptions}
        value={firstMultiSelectOption}
        onChange={setFirstMultiSelectOption}
        dataUieName="firstMultipleSelect"
      />
    </Column>
  </Columns>
</Fragment>;
```
