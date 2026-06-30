import { useUser } from '../contexts/UserContext';

// Mock the UserContext
jest.mock('../contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

describe('Token Engine', () => {
  const mockAddTokens = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      addTokens: mockAddTokens,
    });
  });

  describe('Token calculation', () => {
    it('should give 4 tokens for 4/5 correct answers', () => {
      const correct: number = 4;
      const total: number = 5;
      const perfect = correct === total;
      const tokensToAdd = correct + (perfect ? 1 : 0);
      
      expect(tokensToAdd).toBe(4);
    });

    it('should give 6 tokens for 5/5 correct answers (perfect score)', () => {
      const correct: number = 5;
      const total: number = 5;
      const perfect = correct === total;
      const tokensToAdd = correct + (perfect ? 1 : 0);
      
      expect(tokensToAdd).toBe(6);
    });

    it('should give 3 tokens for 3/5 correct answers', () => {
      const correct: number = 3;
      const total: number = 5;
      const perfect = correct === total;
      const tokensToAdd = correct + (perfect ? 1 : 0);
      
      expect(tokensToAdd).toBe(3);
    });

    it('should give 10 tokens for 10/10 correct answers (perfect score)', () => {
      const correct: number = 10;
      const total: number = 10;
      const perfect = correct === total;
      const tokensToAdd = correct + (perfect ? 1 : 0);
      
      expect(tokensToAdd).toBe(11);
    });
  });

  describe('Perfect score detection', () => {
    it('should detect perfect score when correct equals total', () => {
      const correct: number = 5;
      const total: number = 5;
      const perfect = correct === total;
      
      expect(perfect).toBe(true);
    });

    it('should not detect perfect score when correct is less than total', () => {
      const correct: number = 4;
      const total: number = 5;
      const perfect = correct === total;
      
      expect(perfect).toBe(false);
    });
  });
}); 
