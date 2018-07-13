/* eslint no-magic-numbers: "off" */

const {StandupHandler} = require('../../dist/StandupHandler');

describe('StandupHandler', () => {
  describe('"addParticipant"', () => {
    it('automatically removes people when more people join than the limit allows', () => {
      const benny = '1ee85494-726c-4c7c-90cd-75f19079f7e8';
      const florian = '803cca97-6085-4c6d-b536-34db244a3c05';
      const gregor = '865e70b9-5cfb-47fe-8795-84d231a9389e';
      const lipis = '99d72f1f-6c97-43a3-ba1f-77db69964b2d';
      const michael = '2c623f67-bf4a-432b-a660-1b5986724899';
      const thomas = '9805787c-b048-4865-85f0-7470e7704237';

      const conversationId = '569cda73-9a18-489d-8e60-6d4461e83194';
      const limit = 4;
      const bot = new StandupHandler(conversationId, limit);

      bot.addParticipant(benny);
      bot.addParticipant(florian);
      bot.addParticipant(gregor);
      bot.addParticipant(lipis);

      expect(bot.participants.size()).toBe(limit);

      let kickedOut = bot.addParticipant(michael);
      expect(kickedOut).toBe(benny);

      kickedOut = bot.addParticipant(thomas);
      expect(kickedOut).toBe(florian);
      expect(bot.participants.getAll()).toEqual(
        jasmine.arrayContaining([{[gregor]: gregor}, {[lipis]: lipis}, {[michael]: michael}, {[thomas]: thomas}])
      );
    });

    it('does not add the same user IDs twice', () => {
      const conversationId = '56a0d570-53e9-4ea3-8cbd-3c40c8a41f75';
      const limit = 3;
      const bot = new StandupHandler(conversationId, limit);

      const judith = 'dc806b5f-9ce9-42f3-95b6-005ba4606011';
      const melanie = '122f3472-0678-45d1-9d45-b5e60d48ddcb';
      const tony = '7150212e-046b-492a-a53c-2eaf5741964b';

      bot.addParticipant(judith);
      expect(bot.participants.size()).toBe(1);

      bot.addParticipant(judith);
      expect(bot.participants.size()).toBe(1);

      bot.addParticipant(melanie);
      expect(bot.participants.size()).toBe(2);

      bot.addParticipant(judith);
      expect(bot.participants.size()).toBe(2);

      bot.addParticipant(judith);
      expect(bot.participants.size()).toBe(2);

      bot.addParticipant(tony);
      expect(bot.participants.size()).toBe(3);
    });
  });
});
