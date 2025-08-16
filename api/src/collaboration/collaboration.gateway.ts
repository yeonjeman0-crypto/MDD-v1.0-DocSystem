import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5178'],
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('CollaborationGateway');

  constructor(private readonly collaborationService: CollaborationService) {}

  afterInit(server: Server) {
    this.collaborationService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection-established', {
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.collaborationService.handleParticipantDisconnect(client.id);
  }

  @SubscribeMessage('create-session')
  handleCreateSession(
    @MessageBody() data: {
      documentId: string;
      documentName: string;
      hostId: string;
      hostName: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = this.collaborationService.createSession(
        data.documentId,
        data.documentName,
        data.hostId,
        data.hostName
      );

      // 호스트의 소켓 ID 업데이트
      this.collaborationService.updateParticipantSocket(session.id, data.hostId, client.id);

      // 세션 룸에 클라이언트 추가
      client.join(session.id);

      client.emit('session-created', {
        success: true,
        session: {
          id: session.id,
          documentId: session.documentId,
          documentName: session.documentName,
          participants: Array.from(session.participants.values()),
          createdAt: session.createdAt
        }
      });

      this.logger.log(`Session created: ${session.id} by ${data.hostName}`);
    } catch (error) {
      client.emit('session-created', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody() data: {
      sessionId: string;
      participant: {
        id: string;
        name: string;
        avatar?: string;
        role: 'viewer' | 'editor';
      };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = this.collaborationService.joinSession(data.sessionId, {
        ...data.participant,
        socketId: client.id
      });

      if (result.success && result.session) {
        // 세션 룸에 클라이언트 추가
        client.join(data.sessionId);

        // 참가자의 소켓 ID 업데이트
        this.collaborationService.updateParticipantSocket(
          data.sessionId,
          data.participant.id,
          client.id
        );

        client.emit('session-joined', {
          success: true,
          session: {
            id: result.session.id,
            documentId: result.session.documentId,
            documentName: result.session.documentName,
            participants: Array.from(result.session.participants.values()),
            annotations: result.session.annotations,
            documentState: result.session.documentState
          }
        });

        this.logger.log(`${data.participant.name} joined session: ${data.sessionId}`);
      } else {
        client.emit('session-joined', {
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      client.emit('session-joined', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(
    @MessageBody() data: {
      sessionId: string;
      participantId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.collaborationService.leaveSession(data.sessionId, data.participantId);
      client.leave(data.sessionId);

      client.emit('session-left', {
        success: true,
        sessionId: data.sessionId
      });

      this.logger.log(`Participant ${data.participantId} left session: ${data.sessionId}`);
    } catch (error) {
      client.emit('session-left', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @MessageBody() data: {
      sessionId: string;
      participantId: string;
      pageNumber: number;
      x: number;
      y: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.collaborationService.updateCursor(data.sessionId, data.participantId, {
      pageNumber: data.pageNumber,
      x: data.x,
      y: data.y
    });
  }

  @SubscribeMessage('add-annotation')
  handleAddAnnotation(
    @MessageBody() data: {
      sessionId: string;
      annotation: {
        authorId: string;
        authorName: string;
        pageNumber: number;
        x: number;
        y: number;
        width: number;
        height: number;
        content: string;
        type: 'note' | 'highlight' | 'comment' | 'approval' | 'revision';
      };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const annotation = this.collaborationService.addAnnotation(
        data.sessionId,
        data.annotation
      );

      if (annotation) {
        client.emit('annotation-added-response', {
          success: true,
          annotation
        });
      } else {
        client.emit('annotation-added-response', {
          success: false,
          error: '주석 추가에 실패했습니다.'
        });
      }
    } catch (error) {
      client.emit('annotation-added-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('update-annotation')
  handleUpdateAnnotation(
    @MessageBody() data: {
      sessionId: string;
      annotationId: string;
      updates: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const annotation = this.collaborationService.updateAnnotation(
        data.sessionId,
        data.annotationId,
        data.updates
      );

      client.emit('annotation-updated-response', {
        success: !!annotation,
        annotation
      });
    } catch (error) {
      client.emit('annotation-updated-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('add-annotation-reply')
  handleAddAnnotationReply(
    @MessageBody() data: {
      sessionId: string;
      annotationId: string;
      reply: {
        authorId: string;
        authorName: string;
        content: string;
      };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const reply = this.collaborationService.addAnnotationReply(
        data.sessionId,
        data.annotationId,
        data.reply
      );

      client.emit('annotation-reply-added-response', {
        success: !!reply,
        reply
      });
    } catch (error) {
      client.emit('annotation-reply-added-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('delete-annotation')
  handleDeleteAnnotation(
    @MessageBody() data: {
      sessionId: string;
      annotationId: string;
      deleterId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const success = this.collaborationService.deleteAnnotation(
        data.sessionId,
        data.annotationId,
        data.deleterId
      );

      client.emit('annotation-deleted-response', {
        success,
        annotationId: data.annotationId
      });
    } catch (error) {
      client.emit('annotation-deleted-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('sync-document-state')
  handleSyncDocumentState(
    @MessageBody() data: {
      sessionId: string;
      participantId: string;
      state: {
        pageNumber: number;
        scale: number;
        rotation: number;
        scrollPosition: { x: number; y: number };
      };
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.collaborationService.syncDocumentState(
      data.sessionId,
      data.participantId,
      data.state
    );
  }

  @SubscribeMessage('request-session-info')
  handleRequestSessionInfo(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = this.collaborationService.getSessionInfo(data.sessionId);
      
      if (session) {
        client.emit('session-info-response', {
          success: true,
          session: {
            id: session.id,
            documentId: session.documentId,
            documentName: session.documentName,
            participants: Array.from(session.participants.values()),
            annotations: session.annotations,
            documentState: session.documentState,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity
          }
        });
      } else {
        client.emit('session-info-response', {
          success: false,
          error: '세션을 찾을 수 없습니다.'
        });
      }
    } catch (error) {
      client.emit('session-info-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('request-participants')
  handleRequestParticipants(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const participants = this.collaborationService.getActiveParticipants(data.sessionId);
      client.emit('participants-response', {
        success: true,
        participants
      });
    } catch (error) {
      client.emit('participants-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('request-annotations')
  handleRequestAnnotations(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const annotations = this.collaborationService.getSessionAnnotations(data.sessionId);
      client.emit('annotations-response', {
        success: true,
        annotations
      });
    } catch (error) {
      client.emit('annotations-response', {
        success: false,
        error: error.message
      });
    }
  }

  // 관리자용 이벤트
  @SubscribeMessage('admin-session-stats')
  handleAdminSessionStats(@ConnectedSocket() client: Socket) {
    try {
      const stats = this.collaborationService.getSessionStats();
      client.emit('admin-session-stats-response', {
        success: true,
        stats
      });
    } catch (error) {
      client.emit('admin-session-stats-response', {
        success: false,
        error: error.message
      });
    }
  }

  @SubscribeMessage('admin-cleanup-sessions')
  handleAdminCleanupSessions(@ConnectedSocket() client: Socket) {
    try {
      const cleanedCount = this.collaborationService.cleanupInactiveSessions();
      client.emit('admin-cleanup-sessions-response', {
        success: true,
        cleanedCount
      });
    } catch (error) {
      client.emit('admin-cleanup-sessions-response', {
        success: false,
        error: error.message
      });
    }
  }
}