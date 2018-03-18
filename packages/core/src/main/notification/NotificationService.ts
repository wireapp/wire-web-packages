import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/index';
import APIClient = require('@wireapp/api-client');
import {Notification} from '@wireapp/api-client/dist/commonjs/notification/index';
import {RecordNotFoundError} from '@wireapp/store-engine/dist/commonjs/engine/error';

export default class NotificationService {
  public static STORES = {
    AMPLIFY: 'amplify',
  };

  public static KEYS = {
    PRIMARY_KEY_LAST_EVENT: 'z.storage.StorageKey.EVENT.LAST_DATE',
    PRIMARY_KEY_LAST_NOTIFICATION: 'z.storage.StorageKey.NOTIFICATION.LAST_ID',
  };

  private database: Database;
  private backend: Backend;

  constructor(private apiClient: APIClient, private storeEngine: CRUDEngine) {
    this.database = new Database(this.storeEngine);
    this.backend = new Backend(this.apiClient);
  }

  public initializeNotificationStream(clientId: string): Promise<string> {
    return this.setLastEventDate(new Date(0))
      .then(() => this.backend.getLastNotification(clientId))
      .then(notification => this.setLastNotificationId(notification));
  }

  private setLastEventDate(eventDate: Date): Promise<Date> {
    return this.database
      .getLastEventDate()
      .then(databaseLastEventDate => {
        if (eventDate > databaseLastEventDate) {
          return this.database.updateLastEventDate(eventDate);
        }
        return databaseLastEventDate;
      })
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return this.database.createLastEventDate(eventDate);
        }
        throw error;
      });
  }

  private setLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.database
      .getLastNotificationId()
      .then(() => this.database.updateLastNotificationId(lastNotification))
      .catch(error => this.database.createLastNotificationId(lastNotification));
  }
}

class Database {
  constructor(private storeEngine: CRUDEngine) {}

  public getLastEventDate(): Promise<Date> {
    return this.storeEngine
      .read<{value: string}>(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT)
      .then(({value}) => new Date(value));
  }

  public updateLastEventDate(eventDate: Date): Promise<Date> {
    return this.storeEngine
      .update(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT, {
        value: eventDate.toISOString(),
      })
      .then(() => eventDate);
  }

  public createLastEventDate(eventDate: Date): Promise<Date> {
    return this.storeEngine
      .create(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT, {
        value: eventDate.toISOString(),
      })
      .then(() => eventDate);
  }

  public getLastNotificationId(): Promise<string> {
    return this.storeEngine
      .read<{value: string}>(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION)
      .then(({value}) => value);
  }

  public updateLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.storeEngine
      .update(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION, {
        value: lastNotification.id,
      })
      .then(() => lastNotification.id);
  }

  public createLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.storeEngine
      .create(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION, {
        value: lastNotification.id,
      })
      .then(() => lastNotification.id);
  }
}

class Backend {
  constructor(private apiClient: APIClient) {}

  public getLastNotification(clientId: string): Promise<Notification> {
    return this.apiClient.notification.api.getLastNotification(clientId);
  }
}
