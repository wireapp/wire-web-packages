import axios from 'axios';
import {CallMessage} from '@wireapp/core/dist/conversation/message/OtrMessage';
import {CallingContent} from '@wireapp/core/dist/conversation/content';
import {ENV as AVS_ENV, getAvsInstance, Wcall, LOG_LEVEL, REASON, CALL_TYPE} from '@wireapp/avs';
import type {Account} from '@wireapp/core';
import {RTCAudioSourceWrapper} from './rtcAudioSource';
import {getLogger} from './util/Logger';
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

interface Call {
  clientId: string;
  conversationId: string;
  hasVideo: number;
  shouldRing: number;
  timestamp: number;
  userId: string;
}

export class Avs {
  wCall?: Wcall;
  wUser?: number;
  activeCalls: Record<string, Call> = {};
  mediaStream: MediaStream = new MediaStream();
  audioSource: RTCAudioSourceWrapper = new RTCAudioSourceWrapper();
  logger = getLogger('Avs');

  constructor(private readonly account: Account) {}

  async initAvs(selfUserId: string, clientId: string): Promise<void> {
    const callingInstance = await getAvsInstance();
    const wCall = this.configureCallingApi(callingInstance);
    const wUser = this.createWUser(wCall, selfUserId, clientId);
    this.wUser = wUser;
    this.wCall = wCall;
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
      this.logger.log(error);
    }
  };

  private readonly answerCall = (call: CallMessage) => {
    if (!this.wCall || !this.wUser) {
      throw new Error('wCall or wUser does not exist');
    }
    this.logger.log('\n ANSWERING CALL \n');
    this.wCall.answer(this.wUser, call.conversation, CALL_TYPE.NORMAL, 0);
  };

  private configureCallingApi(wCall: Wcall): Wcall {
    wCall.setLogHandler((level: LOG_LEVEL, message: string) => {
      this.logger.log('\n AVS', level, message, '\n');
    });

    const avsEnv = AVS_ENV.DEFAULT;
    wCall.init(avsEnv);
    wCall.setUserMediaHandler(this.mediaHandler);
    wCall.setMediaStreamHandler(this.onIncomingStream);
    setInterval(() => wCall.poll(), 500);
    return wCall;
  }

  private readonly onIncomingStream = (
    convid: string,
    remote_userid: string,
    remote_clientid: string,
    streams: readonly MediaStream[],
  ): void => {};

  private readonly mediaHandler = async (): Promise<MediaStream> => {
    const mediaStream = this.mediaStream;
    const track = this.audioSource.createTrack();
    mediaStream.addTrack(track);
    return mediaStream;
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
      () => {},
      () => 0,
      () => {},
      () => {},
    );

    wCall.setParticipantChangedHandler(wUser, this.updateCallParticipants);
    return wUser;
  };

  private readonly sendSFTRequest = (
    context: number,
    url: string,
    data: string,
    dataLength: number,
    _: number,
  ): number => {
    this.logger.log('\n sendSFTRequest \n');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const response = await axios.post(url, data);

      const {status, data: axiosData} = response;
      const jsonData = JSON.stringify(axiosData);
      this.wCall!.sftResp(this.wUser!, status, jsonData, jsonData.length, context);
    })();
    return 0;
  };

  private readonly onSendCallMessage = (
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
    void (async () => {
      try {
        const callPayload = this.account!.service!.conversation.messageBuilder.createCall(conversationId, data);
        await this.account!.service!.conversation.send(callPayload);
      } catch (error) {
        this.logger.error('onSendCallMessage error', error);
      }
    })();

    return 0;
  };

  private readonly updateCallParticipants = (conversationId: string, membersJson: string) => {};

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

  private readonly storeCall = (call: Call) => {
    this.activeCalls[call.conversationId] = call;
  };

  private readonly removeCall = (conversationId: string) => {
    delete this.activeCalls[conversationId];
  };
}
