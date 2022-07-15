Demo:

```js
import {Fragment} from 'react';
import {Columns, Column, ErrorMessage, Select} from '@wireapp/react-ui-kit';

const options = [
  {value: '1', label: 'Option 1 long long long long name'},
  {value: '2', label: 'Option 2 longest name'},
  {value: '3', label: 'Option 3', description: 'Custom description for select option'},
  {value: '4', label: 'Option 4', isDisabled: true},
  {value: '5', label: 'Option 5'},
  {value: '6', label: 'Option 6'},
];

<Fragment>
  <Columns>
    <Column>Select</Column>

    <Column>
      <Select
        label="Select"
        id="firstSelect"
        options={options}
        dataUieName="select"
      />
    </Column>
  </Columns>

  <Columns>
    <Column>MultiSelect</Column>

    <Column>
      <Select
        label="Select"
        id="firstMultiSelect"
        options={options}
        defaultValue={options[0]}
        dataUieName="firstMultipleSelect"
        isMulti
      />
    </Column>
  </Columns>

  <Columns>
    <Column>Disabled Select</Column>

    <Column>
      <Select
        isDisabled
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
        dataUieName="invalid-select"
      />
    </Column>
  </Columns>
</>;
```
