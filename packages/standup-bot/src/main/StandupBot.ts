import APIClient = require('@wireapp/api-client');
import LRUCache from '@wireapp/lru-cache';

import {ClientType} from '@wireapp/api-client/dist/commonjs/client/';
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {Account} from '@wireapp/core';
import {MemoryEngine} from '@wireapp/store-engine';

class StandupBot {
  private readonly participants: LRUCache<string>;

  constructor(limit: number) {
    this.participants = new LRUCache<string>(limit);
  }

  async login(email: string, password: string) {
    const login = {
      clientType: ClientType.TEMPORARY,
      email,
      password,
    };
    const backend = APIClient.BACKEND.STAGING;
    const engine = new MemoryEngine();
    await engine.init(email);
    const apiClient = new APIClient(new Config(engine, backend));
    const account = new Account(apiClient);
    await account.login(login);
    await account.listen();
    return account;
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }
}

export {StandupBot};
