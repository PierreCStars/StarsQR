import { describe, it, expect } from 'vitest';
import { buildUrlWithUTM } from './utm';

describe('buildUrlWithUTM', () => {
  it('ajoute les paramètres UTM à une URL', () => {
    const out = buildUrlWithUTM('https://stars.mc', {
      utm_source: 'Showroom',
      utm_medium: 'Displays',
      utm_campaign: 'spring',
    });
    expect(out).toContain('utm_source=Showroom');
    expect(out).toContain('utm_medium=Displays');
    expect(out).toContain('utm_campaign=spring');
  });

  it('ignore les paramètres optionnels vides', () => {
    const out = buildUrlWithUTM('https://stars.mc', {
      utm_source: 'Showroom',
      utm_medium: 'Displays',
      utm_campaign: 'spring',
      utm_term: '',
      utm_content: '   ',
    });
    expect(out).not.toContain('utm_term');
    expect(out).not.toContain('utm_content');
  });

  it('préserve les paramètres de requête existants', () => {
    const out = buildUrlWithUTM('https://stars.mc/page?ref=abc', {
      utm_source: 'Showroom',
      utm_medium: 'Displays',
      utm_campaign: 'spring',
    });
    expect(out).toContain('ref=abc');
    expect(out).toContain('utm_source=Showroom');
  });
});
