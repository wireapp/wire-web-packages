Demo:

```js
import {Fragment} from 'react';
import {Columns, Column, ErrorMessage, Select} from '@wireapp/react-ui-kit';

<Fragment>
  <Columns>
    <Column>Select</Column>

    <Column>
      <Select
        label="Select"
        id="firstSelect"
        options={['Test 1', 'Test 2', 'Test3']}
        onChange={selectedOption => console.log('Selected option', selectedOption)}
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
        options={['Test 1', 'Test 2', 'Test3']}
        onChange={selectedOption => console.log('Selected option', selectedOption)}
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
        options={['Test 1', 'Test 2', 'Test3']}
        onChange={selectedOption => console.log('Selected option', selectedOption)}
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
        options={['Test 1', 'Test 2', 'Test3']}
        onChange={selectedOption => console.log('Selected option', selectedOption)}
      />
    </Column>
  </Columns>
</Fragment>;
```
