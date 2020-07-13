/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {MessageHandler} from '@wireapp/bot-api';
import {PayloadBundle} from '@wireapp/core/dist/conversation/';
import {CallingContent} from '@wireapp/core/dist/conversation/content';
import {CallMessage} from '@wireapp/core/dist/conversation/message/OtrMessage';
import {CALL_TYPE, CONV_TYPE, ENV as AVS_ENV, getAvsInstance, LOG_LEVEL, REASON, Wcall} from '@wireapp/avs';
import {Call} from './Call';
import {CallConfigData} from '@wireapp/api-client/dist/account';
import axios from 'axios';

export class AVSHandler extends MessageHandler {
  private wCall?: Wcall;
  private wUser?: number;
  private activeCalls: Record<string, Call> = {};
  private readonly mediaStream: MediaStream = new MediaStream();

  async init(): Promise<void> {
    const {clientId, userId} = this.account!;
    const callingInstance = await getAvsInstance();
    const wCall = this.configureCallingApi(callingInstance);
    const wUser = this.createWUser(wCall, userId, clientId);
    this.wUser = wUser;
    this.wCall = wCall;
  }

  public onIncomingCallMessage(callMessage: CallMessage) {
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

  private readonly answerCall = (call: CallMessage) => {
    if (!this.wCall || !this.wUser) {
      throw new Error('wCall or wUser does not exist');
    }
    this.wCall.answer(this.wUser, call.conversation, CALL_TYPE.NORMAL, 0);
  };

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
      .then((config: CallConfigData) => {
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

  async startCall(conversationId: string, conversationType: CONV_TYPE, callType: CALL_TYPE): Promise<void> {
    if (this.wCall && typeof this.wUser === 'number') {
      this.wCall!.start(this.wUser!, conversationId, callType, conversationType, 0);
      return;
    }
    throw new Error('unable to start a new call, this.wCall or this.wUser does not exist');
  }

  async handleEvent(payload: PayloadBundle): Promise<void> {}
}
