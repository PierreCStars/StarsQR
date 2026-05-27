import { describe, it, expect } from 'vitest';
import { generateShortCode, validateUrl } from './urlShortener';

describe('urlShortener', () => {
  it('génère un code de 6 caractères alphanumériques', () => {
    expect(generateShortCode()).toMatch(/^[A-Za-z0-9]{6}$/);
  });
  it('valide les URLs', () => {
    expect(validateUrl('https://stars.mc')).toBe(true);
    expect(validateUrl('pas-une-url')).toBe(false);
  });
});
