export interface GeneratedFlashcard {
    question: string;
    answer: string;
  }
  
  export interface GenerateResponse {
    flashcards: GeneratedFlashcard[];
  }
  
  export interface APIErrorResponse {
    error: string;
  }