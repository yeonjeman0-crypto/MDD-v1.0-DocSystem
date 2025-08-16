import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface CollaborationSession {
  id: string;
  documentId: string;
  documentName: string;
  participants: Map<string, Participant>;
  annotations: Annotation[];
  cursors: Map<string, CursorPosition>;
  documentState: any;
  createdAt: Date;
  lastActivity: Date;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'viewer' | 'editor' | 'admin';
  joinedAt: Date;
  isActive: boolean;
  socketId: string;
}

export interface Annotation {
  id: string;
  authorId: string;
  authorName: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  type: 'note' | 'highlight' | 'comment' | 'approval' | 'revision';
  status: 'active' | 'resolved' | 'deleted';
  thread: AnnotationReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface CursorPosition {
  participantId: string;
  pageNumber: number;
  x: number;
  y: number;
  lastUpdate: Date;
}

export interface DocumentChange {
  type: 'annotation' | 'page' | 'zoom' | 'selection';
  data: any;
  authorId: string;
  timestamp: Date;
}

@Injectable()
export class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  createSession(documentId: string, documentName: string, hostId: string, hostName: string): CollaborationSession {
    const sessionId = this.generateSessionId();
    
    const host: Participant = {
      id: hostId,
      name: hostName,
      role: 'admin',
      joinedAt: new Date(),
      isActive: true,
      socketId: ''
    };

    const session: CollaborationSession = {
      id: sessionId,
      documentId,
      documentName,
      participants: new Map([[hostId, host]]),
      annotations: [],
      cursors: new Map(),
      documentState: {},
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  joinSession(sessionId: string, participant: Omit<Participant, 'joinedAt' | 'isActive'>): {
    success: boolean;
    session?: CollaborationSession;
    error?: string;
  } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { success: false, error: '세션을 찾을 수 없습니다.' };
    }

    const fullParticipant: Participant = {
      ...participant,
      joinedAt: new Date(),
      isActive: true
    };

    session.participants.set(participant.id, fullParticipant);
    session.lastActivity = new Date();

    // 다른 참가자들에게 새 참가자 알림
    this.broadcastToSession(sessionId, 'participant-joined', {
      participant: fullParticipant,
      totalParticipants: session.participants.size
    }, participant.id);

    return { success: true, session };
  }

  leaveSession(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(participantId);
    if (participant) {
      session.participants.delete(participantId);
      session.cursors.delete(participantId);
      session.lastActivity = new Date();

      // 다른 참가자들에게 알림
      this.broadcastToSession(sessionId, 'participant-left', {
        participantId,
        participantName: participant.name,
        totalParticipants: session.participants.size
      });

      // 세션에 참가자가 없으면 세션 정리
      if (session.participants.size === 0) {
        this.cleanupSession(sessionId);
      }
    }
  }

  updateCursor(sessionId: string, participantId: string, position: Omit<CursorPosition, 'participantId' | 'lastUpdate'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const cursorPosition: CursorPosition = {
      participantId,
      ...position,
      lastUpdate: new Date()
    };

    session.cursors.set(participantId, cursorPosition);
    session.lastActivity = new Date();

    // 다른 참가자들에게 커서 위치 브로드캐스트
    this.broadcastToSession(sessionId, 'cursor-update', cursorPosition, participantId);
  }

  addAnnotation(sessionId: string, annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt' | 'thread' | 'status'>): Annotation | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const fullAnnotation: Annotation = {
      ...annotation,
      id: this.generateAnnotationId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      thread: [],
      status: 'active'
    };

    session.annotations.push(fullAnnotation);
    session.lastActivity = new Date();

    // 모든 참가자에게 새 주석 브로드캐스트
    this.broadcastToSession(sessionId, 'annotation-added', fullAnnotation);

    return fullAnnotation;
  }

  updateAnnotation(sessionId: string, annotationId: string, updates: Partial<Annotation>): Annotation | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const annotationIndex = session.annotations.findIndex(a => a.id === annotationId);
    if (annotationIndex === -1) return null;

    const annotation = session.annotations[annotationIndex];
    const updatedAnnotation = {
      ...annotation,
      ...updates,
      updatedAt: new Date()
    };

    session.annotations[annotationIndex] = updatedAnnotation;
    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, 'annotation-updated', updatedAnnotation);

    return updatedAnnotation;
  }

  addAnnotationReply(sessionId: string, annotationId: string, reply: Omit<AnnotationReply, 'id' | 'createdAt'>): AnnotationReply | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const annotation = session.annotations.find(a => a.id === annotationId);
    if (!annotation) return null;

    const fullReply: AnnotationReply = {
      ...reply,
      id: this.generateReplyId(),
      createdAt: new Date()
    };

    annotation.thread.push(fullReply);
    annotation.updatedAt = new Date();
    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, 'annotation-reply-added', {
      annotationId,
      reply: fullReply
    });

    return fullReply;
  }

  deleteAnnotation(sessionId: string, annotationId: string, deleterId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const annotationIndex = session.annotations.findIndex(a => a.id === annotationId);
    if (annotationIndex === -1) return false;

    const annotation = session.annotations[annotationIndex];
    
    // 작성자나 관리자만 삭제 가능
    const participant = session.participants.get(deleterId);
    if (annotation.authorId !== deleterId && participant?.role !== 'admin') {
      return false;
    }

    annotation.status = 'deleted';
    annotation.updatedAt = new Date();
    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, 'annotation-deleted', {
      annotationId,
      deleterId
    });

    return true;
  }

  syncDocumentState(sessionId: string, participantId: string, state: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.documentState = state;
    session.lastActivity = new Date();

    this.broadcastToSession(sessionId, 'document-state-sync', state, participantId);
  }

  getSessionInfo(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getActiveParticipants(sessionId: string): Participant[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.participants.values()).filter(p => p.isActive);
  }

  getSessionAnnotations(sessionId: string): Annotation[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.annotations.filter(a => a.status === 'active');
  }

  // 비활성 세션 정리
  cleanupInactiveSessions(): number {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30분
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold) {
        this.cleanupSession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // 세션 통계
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    totalParticipants: number;
    totalAnnotations: number;
  } {
    let activeSessions = 0;
    let totalParticipants = 0;
    let totalAnnotations = 0;

    for (const session of this.sessions.values()) {
      if (session.participants.size > 0) {
        activeSessions++;
      }
      totalParticipants += session.participants.size;
      totalAnnotations += session.annotations.length;
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      totalParticipants,
      totalAnnotations
    };
  }

  private broadcastToSession(sessionId: string, event: string, data: any, excludeParticipantId?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !this.server) return;

    for (const participant of session.participants.values()) {
      if (excludeParticipantId && participant.id === excludeParticipantId) continue;
      if (participant.socketId) {
        this.server.to(participant.socketId).emit(event, data);
      }
    }
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // 모든 참가자에게 세션 종료 알림
      this.broadcastToSession(sessionId, 'session-ended', {
        sessionId,
        reason: 'No active participants'
      });

      this.sessions.delete(sessionId);
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateAnnotationId(): string {
    return 'ann_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateReplyId(): string {
    return 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Socket 관리
  updateParticipantSocket(sessionId: string, participantId: string, socketId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(participantId);
    if (participant) {
      participant.socketId = socketId;
      participant.isActive = true;
    }
  }

  handleParticipantDisconnect(socketId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      for (const [participantId, participant] of session.participants.entries()) {
        if (participant.socketId === socketId) {
          participant.isActive = false;
          this.leaveSession(sessionId, participantId);
          return;
        }
      }
    }
  }
}