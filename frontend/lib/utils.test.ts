import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges class names and resolves conflicts', () => {
    expect(cn('px-2', 'px-4', 'text-sm')).toBe('px-4 text-sm');
  });

  it('ignores falsey values', () => {
    expect(cn('text-sm', false, null, undefined, 'font-medium')).toBe('text-sm font-medium');
  });
});
