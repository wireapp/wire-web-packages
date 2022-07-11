Demo:

```js
import {Fragment, useState} from 'react';
import {Columns, Column, ErrorMessage, Select} from '@wireapp/react-ui-kit';

const options = [
  {value: '1', label: 'Option 1 long long long long name'},
  {value: '2', label: 'Option 2 longest name'},
  {value: '3', label: 'Option 3'},
  {value: '4', label: 'Option 4'},
  {value: '5', label: 'Option 5'},
  {value: '6', label: 'Option 6'},
];

const [firstSelectOption, setFirstSelectOption] = useState(options[0]);
const [multiSelectOptions, setMultiSelectOptions] = useState([options[0], options[1], options[2]]);
const [secondSelectOption, setSecondSelectOption] = useState(null);
const [thirdSelectOption, setThirdSelectOption] = useState(null);

<Fragment>
  <Columns>
    <Column>Select</Column>

    <Column>
      <Select
        label="Select"
        id="firstSelect"
        options={options}
        value={firstSelectOption}
        onChange={setFirstSelectOption}
        dataUieName="select"
      />
    </Column>
  </Columns>

  <Columns>
    <Column>Multi Select</Column>

    <Column>
      <Select
        isMultiSelect
        label="Multi Select"
        id="multiSelect"
        options={options}
        value={multiSelectOptions}
        onChange={setMultiSelectOptions}
        dataUieName="select"
      />
    </Column>
  </Columns>

  <Columns>
    <Column>Disabled Select</Column>

    <Column>
      <Select
        disabled
        label="Disabled select"
        id="disabledSelect"
        options={options}
        onChange={selectedOption => console.log('Selected option', selectedOption)}
        dataUieName="disabled-select"
      />
    </Column>
  </Columns>

  <Columns>
    <Column>Required Select</Column>

    <Column>
      <Select
        label="Required select"
        required
        id="requiredSelect"
        options={options}
        value={secondSelectOption}
        onChange={setSecondSelectOption}
        dataUieName="required-select"
      />
    </Column>
  </Columns>

  <Columns>
    <Column>Invalid Select</Column>

    <Column>
      <Select
        markInvalid
        label="InputLabel"
        id="invalidSelect"
        required
        error={<ErrorMessage>Error message</ErrorMessage>}
        options={options}
        value={thirdSelectOption ? options.find(option => option.value === thirdSelectOption) : null}
        onChange={setThirdSelectOption}
        dataUieName="invalid-select"
      />
    </Column>
  </Columns>
</Fragment>;
```
