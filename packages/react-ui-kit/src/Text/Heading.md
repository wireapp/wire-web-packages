```jsx
import {Heading, Checkbox, CheckboxLabel, Pill, PILL_TYPE} from '@wireapp/react-ui-kit';
console.log('hi');
<div>
  <Heading>Heading</Heading>;
  <Checkbox>
    <CheckboxLabel>Dark Theme</CheckboxLabel>
  </Checkbox>
  ;<Pill>Default Pill</Pill>
  <Pill active>Active default Pill</Pill>
  <Pill type={PILL_TYPE.error}>Error Pill</Pill>
  <Pill type={PILL_TYPE.success}>Success Pill</Pill>
  <Pill type={PILL_TYPE.warning}>Warning Pill</Pill>
</div>;
```
