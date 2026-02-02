export interface ProcessedNote {
  rawText: string;
  formattedText: string;
  detectedLanguage?: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AppState {
  uploadedFiles: UploadedFile[];
  status: ProcessingStatus;
  messages: ChatMessage[]; // Replaces 'result'
  error: string | null;
  options: {
    includeBanglaExplanation: boolean;
  };
}

export type FileType = 'image' | 'pdf';