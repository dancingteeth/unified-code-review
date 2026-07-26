'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateGenerationParams,
  validateAspectRatio
} = require('../src/InputValidator');

describe('InputValidator', () => {
  it('accepts standard generation params', () => {
    const result = validateGenerationParams('1:1', 'standard');
    assert.equal(result.aspectRatio, '1:1');
    assert.equal(result.generationMode, 'standard');
  });

  it('rejects portrait aspect ratios not in schema', () => {
    assert.throws(() => validateAspectRatio('2:3'));
  });
});
