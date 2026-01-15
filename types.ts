
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // base64 strings
}

export interface AppState {
  messages: Message[];
  uploadedPhotos: string[]; // Reference photos of the couple
  generatedImages: string[];
  isThinking: boolean;
  step: 'identity' | 'gathering' | 'preview';
}

export enum WeddingPillar {
  ATTIRE = 'attire',
  LOCATION = 'location',
  INTERACTION = 'interaction'
}
