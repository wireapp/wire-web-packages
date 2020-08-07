## @wireapp/bot-handler-wizard

Add a conversational UI (wizard) handler to a Wire bot instance.

**Demo**

```typescript
// ...
import {Bot} from '@wireapp/bot-api';
import {Prompt} from 'wizardy';

interface AddUserProps {
  firstName: string;
  lastName: string;
  age: number;
}

const questionnaire: Prompt<string | number>[] = [
  {
    answerKey: 'firstName',
    answerValue: (firstName: string): string => firstName,
    question: `What's your first name?`,
    response: 'Ok.',
  },
  {
    answerKey: 'lastName',
    answerValue: (lastName: string): string => lastName,
    question: `What's your last name?`,
    response: 'Nice to meet you.',
  },
  {
    answerKey: 'age',
    answerValue: (age: string): number => {
      const ageValue = parseInt(age, 10);
      if (!ageValue) {
        throw Error(`I'm sorry. I did not understand that. Please enter a valid number.`);
      }
      return ageValue;
    },
    question: `Would you mind telling me your age?`,
    response: 'Thank you.',
  },
];

const onFinish = (user: AddUserProps) => {
  console.log(`There is a user called "${user.firstName} ${user.lastName}"...`);
};

const addUserWizard = new WizardHandler<AddUserProps>('/add user', questionnaire, onFinish);

const bot = new Bot(...);
bot.addHandler(addUserWizard);
```
