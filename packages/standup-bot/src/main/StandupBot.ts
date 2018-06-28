import LRUCache from '@wireapp/lru-cache';

class StandupBot {
  private readonly participants: LRUCache<string>;

  constructor(limit: number) {
    this.participants = new LRUCache<string>(limit);
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }
}

export {StandupBot};
