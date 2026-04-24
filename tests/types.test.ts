import { describe, it, expect } from 'vitest';
import { DIMENSIONS } from '@/lib/types';

describe('types', () => {
  it('DIMENSIONS constant lists all 12 dimensions', () => {
    expect(DIMENSIONS).toHaveLength(12);
    const expected = [
      'academic', 'cost', 'english', 'language',
      'climate', 'city', 'nature', 'travel',
      'career', 'adventure', 'social', 'easy',
    ];
    for (const dim of expected) {
      expect(DIMENSIONS).toContain(dim);
    }
  });
});
