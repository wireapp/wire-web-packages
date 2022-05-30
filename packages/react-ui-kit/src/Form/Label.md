Demo:

```js
import {Fragment} from 'react';
import {Columns, Column} from '@wireapp/react-ui-kit';
import Label from './Label';

<Fragment>
  <Columns>
    <Column>Label Default</Column>

    <Column>
      <Label>Label</Label>
    </Column>
  </Columns>

  <Columns>
    <Column>Label - Mandatory</Column>

    <Column>
      <Label isRequired>Label</Label>
    </Column>
  </Columns>

  <Columns>
    <Column>Label - Invalid</Column>

    <Column>
      <Label markInvalid>Label</Label>
    </Column>
  </Columns>
</Fragment>;
```
