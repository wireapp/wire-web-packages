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
    return this.database
      .setLastEventDate(new Date(0))
      .then(() => this.backend.getLastNotification(clientId))
      .then(notification => this.database.setLastNotificationId(notification));
  }
}

class Database {
  constructor(private storeEngine: CRUDEngine) {}
  private getLastEventDate(): Promise<Date> {
    return this.storeEngine
      .read<{value: string}>(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT)
      .then(({value}) => new Date(value));
  }

  public setLastEventDate(eventDate: Date): Promise<Date> {
    return this.getLastEventDate()
      .then(databaseLastEventDate => {
        if (eventDate > databaseLastEventDate) {
          return this.storeEngine
            .update(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT, {
              value: eventDate.toISOString(),
            })
            .then(() => eventDate);
        }
        return databaseLastEventDate;
      })
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return this.storeEngine
            .create<{value: string}>(
              NotificationService.STORES.AMPLIFY,
              NotificationService.KEYS.PRIMARY_KEY_LAST_EVENT,
              {
                value: eventDate.toISOString(),
              }
            )
            .then(() => eventDate);
        }
        throw error;
      });
  }

  private getLastNotificationId(): Promise<string> {
    return this.storeEngine
      .read<{value: string}>(NotificationService.STORES.AMPLIFY, NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION)
      .then(({value}) => value);
  }

  public setLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.getLastNotificationId()
      .then(() =>
        this.storeEngine.update(
          NotificationService.STORES.AMPLIFY,
          NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION,
          {value: lastNotification.id}
        )
      )
      .catch(() =>
        this.storeEngine.create(
          NotificationService.STORES.AMPLIFY,
          NotificationService.KEYS.PRIMARY_KEY_LAST_NOTIFICATION,
          {value: lastNotification.id}
        )
      )
      .then(() => lastNotification.id);
  }
}

class Backend {
  constructor(private apiClient: APIClient) {}

  public getLastNotification(clientId: string): Promise<Notification> {
    return this.apiClient.notification.api.getLastNotification(clientId);
  }
}
