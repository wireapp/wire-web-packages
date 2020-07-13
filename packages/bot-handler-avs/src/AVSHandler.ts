import {MessageHandler} from '@wireapp/bot-api';
import {PayloadBundle} from '@wireapp/core/dist/conversation/';
import {Call} from './Call';
import {CONV_TYPE, ENV as AVS_ENV, getAvsInstance, LOG_LEVEL, REASON, Wcall} from '@wireapp/avs';
import {CALL_TYPE} from '@wireapp/avs/dist/avs_wcall';
import axios from 'axios';
import {CallMessage} from '@wireapp/core/dist/conversation/message/OtrMessage';
import {CallingContent} from '@wireapp/core/dist/conversation/content';
import {CallConfigData} from '@wireapp/api-client/dist/account';

export class AVSHandler extends MessageHandler {
  private wCall?: Wcall;
  private wUser?: number;
  private activeCalls: Record<string, Call> = {};
  private readonly mediaStream: MediaStream = new MediaStream();

  async handleEvent(payload: PayloadBundle): Promise<void> {}

  async init(): Promise<void> {
    const {clientId, userId} = this.account!;
    const callingInstance = await getAvsInstance();
    const wCall = this.configureCallingApi(callingInstance);
    const wUser = this.createWUser(wCall, userId, clientId);
    this.wUser = wUser;
    this.wCall = wCall;
  }

  onIncomingCallMessage(callMessage: CallMessage): void {
    const callContent: CallingContent = callMessage.content;

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
  }

  startCall(conversationId: string, conversationType: CONV_TYPE, callType: CALL_TYPE): void {
    this.wCall!.start(this.wUser!, conversationId, callType, conversationType, 0);
  }

  private answerCall(call: CallMessage) {
    this.wCall!.answer(this.wUser!, call.conversation, CALL_TYPE.NORMAL, 0);
  }

  private configureCallingApi(wCall: Wcall): Wcall {
    wCall.setLogHandler((level: LOG_LEVEL, message: string) => {
      console.info(`${level}: ${message}`);
    });

    const avsEnv = AVS_ENV.DEFAULT;
    wCall.init(avsEnv);
    wCall.setUserMediaHandler(this.mediaHandler);
    wCall.setMediaStreamHandler(() => {});
    setInterval(() => wCall.poll(), 500);
    return wCall;
  }

  private readonly mediaHandler = async (): Promise<MediaStream> => {
    return this.mediaStream;
  };

  private readonly createWUser = (wCall: Wcall, selfUserId: string, selfClientId: string): number => {
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
      this.callConfigRequestHandler,
      () => 0,
      () => {},
      () => {},
    );

    wCall.setParticipantChangedHandler(wUser, () => {});
    return wUser;
  };

  private callConfigRequestHandler(convid: string, metrics_json: string, arg: number) {
    this.account!.service!.account.getCallConfig()
      .then(config => {
        this.wCall!.configUpdate(this.wUser!, 0, JSON.stringify(config));
      })
      .catch(console.error);

    return 0;
  }

  private readonly sendSFTRequest = (
    context: number,
    url: string,
    data: string,
    dataLength: number,
    _: number,
  ): number => {
    void (async () => {
      try {
        const response = await axios.post(url, data);
        const {status, data: axiosData} = response;
        const jsonData = JSON.stringify(axiosData);
        this.wCall!.sftResp(this.wUser!, status, jsonData, jsonData.length, context);
      } catch (error) {
        console.info('Failed to send SFT request', error);
      }
    })();
    return 0;
  };

  private readonly onSendCallMessage = (
    ctx: number,
    conversationId: string,
    selfUserId: string,
    selfClientId: string,
    userid_dest?: string,
    clientid_dest?: string,
    data: string,
  ): number => {
    void (async () => {
      const callPayload = this.account!.service!.conversation.messageBuilder.createCall(conversationId, data);
      await this.account!.service!.conversation.send(callPayload);
    })();

    return 0;
  };

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
    this.removeCall(conversationId);
  };

  private readonly storeCall = (call: Call) => {
    this.activeCalls[call.conversationId] = call;
  };

  private readonly removeCall = (conversationId: string) => {
    delete this.activeCalls[conversationId];
  };
}
