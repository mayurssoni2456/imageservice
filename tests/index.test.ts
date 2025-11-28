import { greet } from '../src/index';

describe('greet', () => {
  it('should return "Hello World!" when called without arguments', () => {
    expect(greet()).toBe('Hello World!');
  });

  it('should return personalized greeting when name is provided', () => {
    expect(greet('TypeScript')).toBe('Hello TypeScript!');
  });

  it('should handle empty string', () => {
    expect(greet('')).toBe('Hello !');
  });
});
