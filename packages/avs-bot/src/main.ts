/* eslint-disable no-console */
import * as path from 'path';
import {FileEngine} from '@wireapp/store-engine-fs';
import {Account} from '@wireapp/core';
import axios from 'axios';
import {ENV as AVS_ENV, getAvsInstance, Wcall, LOG_LEVEL, REASON, CALL_TYPE} from '@wireapp/avs';
import {APIClient} from '@wireapp/api-client';
import {ClientType} from '@wireapp/api-client/dist/client';
import {
  AUTH_TABLE_NAME,
  AUTH_COOKIE_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  AccessTokenData,
  Cookie,
  LoginData,
} from '@wireapp/api-client/dist/auth';
import {CRUDEngine} from '@wireapp/store-engine';
import {PayloadBundleType} from '@wireapp/core/dist/conversation';
import {CallMessage} from '@wireapp/core/dist/conversation/message/OtrMessage';
import {CallingContent} from '@wireapp/core/dist/conversation/content';
import {RTCAudioSourceWrapper} from './rtcAudioSource';

const wrtc = require('wrtc');

declare global {
  namespace NodeJS {
    interface Global {
      getUserMedia: NavigatorGetUserMedia;
      MediaStream: MediaStream;
      MediaStreamTrack: MediaStreamTrack;
      navigator: Navigator;
      nonstandard: {
        i420ToRgba: unknown;
        rgbaToI420: unknown;
        RTCAudioSink: unknown;
        RTCAudioSource: unknown;
        RTCVideoSink: unknown;
        RTCVideoSource: unknown;
      };
      RTCDataChannel: RTCDataChannel;
      RTCDataChannelEvent: RTCDataChannelEvent;
      RTCDtlsTransport: RTCDtlsTransport;
      RTCIceCandidate: RTCIceCandidate;
      RTCIceTransport: RTCIceTransport;
      RTCPeerConnection: RTCPeerConnection;
      RTCPeerConnectionIceEvent: RTCPeerConnectionIceEvent;
      RTCRtpReceiver: RTCRtpReceiver;
      RTCRtpSender: RTCRtpSender;
      RTCRtpTransceiver: RTCRtpTransceiver;
      RTCSctpTransport: RTCSctpTransport;
      RTCSessionDescription: RTCSessionDescription;
    }
  }
}

if (typeof RTCPeerConnection === 'undefined') {
  global.RTCPeerConnection = wrtc.RTCPeerConnection;
  global.MediaStream = wrtc.MediaStream;
  global.MediaStreamTrack = wrtc.MediaStreamTrack;
  global.navigator = {
    ...global.navigator,
    mediaDevices: {
      ...(global.navigator || {}).mediaDevices,
      getUserMedia: wrtc.getUserMedia,
    },
  };
}

require('dotenv').config();
const {WIRE_EMAIL, WIRE_PASSWORD} = process.env;
const CLIENT_TYPE = ClientType.TEMPORARY;

const loginData: LoginData = {
  clientType: CLIENT_TYPE,
  email: WIRE_EMAIL,
  password: WIRE_PASSWORD,
};

if (!WIRE_EMAIL || !WIRE_PASSWORD) {
  console.error('You need to set WIRE_EMAIL & WIRE_PASSWORD');
  process.exit();
}

interface Call {
  clientId: string;
  conversationId: string;
  hasVideo: number;
  shouldRing: number;
  timestamp: number;
  userId: string;
}

class App {
  storagePath = path.join(process.cwd(), '.tmp', WIRE_EMAIL || '');
  storeOptions = {fileExtension: '.json'};
  storeEngine: CRUDEngine = new FileEngine(this.storagePath, this.storeOptions);
  wUser?: number;
  wCall?: Wcall;
  cookie?: Cookie;
  activeCalls: {[key: string]: Call} = {};
  account?: Account;
  mediaStream: MediaStream = new MediaStream();
  audioSource: RTCAudioSourceWrapper = new RTCAudioSourceWrapper();

  public async start() {
    await this.storeEngine.init(this.storagePath, this.storeOptions);
    const config = {
      store: this.storeEngine,
      urls: APIClient.BACKEND.STAGING,
    };
    const apiClient = new APIClient(config);
    const account = new Account(apiClient, async (): Promise<CRUDEngine> => this.storeEngine);
    this.account = account;

    apiClient.on(APIClient.TOPIC.ACCESS_TOKEN_REFRESH, async (accessToken: AccessTokenData) => {
      await this.storeEngine.updateOrCreate(AUTH_TABLE_NAME, AUTH_ACCESS_TOKEN_KEY, accessToken);
    });

    apiClient.on(APIClient.TOPIC.COOKIE_REFRESH, async (cookie?: Cookie) => {
      console.log('new cookie', cookie);
      if (!cookie) {
        return;
      }
      this.cookie = cookie;
      const entity = {expiration: cookie.expiration, zuid: cookie.zuid};
      await this.storeEngine.updateOrCreate(AUTH_TABLE_NAME, AUTH_COOKIE_KEY, entity);
    });

    await this.getCookie();

    let userId: string;
    try {
      if (!this.cookie) {
        throw new Error('No cookie found');
      }
      userId = (await account.init(CLIENT_TYPE, this.cookie)).userId;
    } catch (error) {
      console.log('Failed to get new access token with cookie');
      userId = (await account.login(loginData)).userId;
    }
    const {
      localClient: {id: clientId},
    } = await account.initClient(loginData);
    await this.initAvs(userId, clientId);

    account.on(PayloadBundleType.CALL, call => {
      this.onIncomingCallMessage(call);
    });

    await account.listen();
  }

  onIncomingCallMessage = (callMessage: CallMessage) => {
    try {
      const callContent: CallingContent = callMessage.content as CallingContent;
      if (!callMessage.fromClientId) {
        throw new Error('callMessage.fromClientId not found');
      }
      const avsResult = this.wCall!.recvMsg(
        this.wUser!,
        callContent,
        callContent.length,
        new Date().getSeconds(),
        new Date(callMessage.timestamp).getSeconds(),
        callMessage.conversation,
        callMessage.from,
        callMessage.fromClientId,
      );
      if (avsResult !== 0) {
        throw new Error(`recvMsg failed with code "${avsResult}"`);
      }
      this.answerCall(callMessage);
    } catch (error) {
      console.log(error);
    }
  };

  answerCall = (call: CallMessage) => {
    if (!this.wCall || !this.wUser) {
      throw new Error('wCall or wUser does not exist');
    }
    console.log('\n ANSWERING CALL \n');
    this.wCall.answer(this.wUser, call.conversation, CALL_TYPE.NORMAL, 0);
  };

  async getCookie(): Promise<Cookie | undefined> {
    try {
      const {expiration, zuid} = await this.storeEngine.read(AUTH_TABLE_NAME, AUTH_COOKIE_KEY);
      const cookie = new Cookie(zuid, expiration);
      this.cookie = cookie;
      return cookie;
    } catch (error) {
      console.log('no cookie found');
      return undefined;
    }
  }

  async initAvs(selfUserId: string, clientId: string): Promise<{wCall: Wcall; wUser: number}> {
    const callingInstance = await getAvsInstance();
    const wCall = this.configureCallingApi(callingInstance);
    const wUser = this.createWUser(wCall, selfUserId, clientId);
    this.wUser = wUser;
    this.wCall = wCall;
    return {wCall: wCall, wUser};
  }

  configureCallingApi(wCall: Wcall): Wcall {
    wCall.setLogHandler((level: LOG_LEVEL, message: string) => {
      console.log('\n AVS', level, message, '\n');
    });

    const avsEnv = AVS_ENV.DEFAULT;
    wCall.init(avsEnv);
    wCall.setUserMediaHandler(this.mediaHandler);
    wCall.setMediaStreamHandler(this.onIncomingStream);
    setInterval(() => wCall.poll(), 500);
    return wCall;
  }

  onIncomingStream = (
    convid: string,
    remote_userid: string,
    remote_clientid: string,
    streams: readonly MediaStream[],
  ): void => {};

  mediaHandler = async (): Promise<MediaStream> => {
    const mediaStream = this.mediaStream;
    const track = this.audioSource.createTrack();
    mediaStream.addTrack(track);
    return mediaStream;
  };

  createWUser(wCall: Wcall, selfUserId: string, selfClientId: string): number {
    /* cspell:disable */
    const wUser = wCall.create(
      selfUserId,
      selfClientId,
      () => {},
      this.onSendCallMessage,
      this.sendSFTRequest,
      this.onIncomingCall,
      () => {},
      () => {},
      () => {},
      this.callClosed,
      () => {},
      () => 0,
      () => {},
      () => {},
    );

    wCall.setParticipantChangedHandler(wUser, this.updateCallParticipants);
    return wUser;
  }

  private readonly sendSFTRequest = (
    context: number,
    url: string,
    data: string,
    dataLength: number,
    _: number,
  ): number => {
    console.log('\n sendSFTRequest \n');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const response = await axios.post(url, data);

      const {status, data: axiosData} = response;
      const jsonData = JSON.stringify(axiosData);
      this.wCall!.sftResp(this.wUser!, status, jsonData, jsonData.length, context);
    })();
    return 0;
  };

  onSendCallMessage = (
    ctx: number,
    conversationId: string,
    selfUserId: string,
    selfClientId: string,
    userid_dest: string | undefined,
    clientid_dest: string | undefined,
    data: string,
    len: number,
    trans: number,
    arg: number,
  ): number => {
    const callPayload = this.account!.service!.conversation.messageBuilder.createCall(conversationId, data);
    this.account!.service!.conversation.send(callPayload).catch(error =>
      console.error('onSendCallMessage error', error),
    );

    return 0;
  };

  updateCallParticipants = (conversationId: string, membersJson: string) => {};

  private readonly onIncomingCall = (
    conversationId: string,
    timestamp: number,
    userId: string,
    clientId: string,
    hasVideo: number,
    shouldRing: number,
  ) => {
    const call: Call = {
      clientId,
      conversationId,
      hasVideo,
      shouldRing,
      timestamp,
      userId,
    };
    this.storeCall(call);
  };

  private readonly callClosed = (reason: REASON, conversationId: string) => {
    this.audioSource.stop();
    this.removeCall(conversationId);
  };

  storeCall(call: Call) {
    this.activeCalls[call.conversationId] = call;
  }

  removeCall(conversationId: string) {
    delete this.activeCalls[conversationId];
  }
}

const Bot = new App();

Bot.start()
  .then(console.log)
  .catch(error => console.log('Failed to start bot with error:', error));
