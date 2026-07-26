'use strict';

const ASPECT_RATIO_SCHEMA = ['1:1', '9:16', '16:9'];
const GENERATION_MODE_SCHEMA = ['fast', 'standard', 'hd', 'vector', 'vector_fast'];

function validateAspectRatio(value) {
  if (!ASPECT_RATIO_SCHEMA.includes(value)) {
    throw new Error(`Invalid aspect ratio: ${value}`);
  }
  return value;
}

function validateGenerationMode(value) {
  if (!GENERATION_MODE_SCHEMA.includes(value)) {
    throw new Error(`Invalid generation mode: ${value}`);
  }
  return value;
}

function validateGenerationParams(aspectRatio, generationMode) {
  return {
    aspectRatio: validateAspectRatio(aspectRatio),
    generationMode: validateGenerationMode(generationMode)
  };
}

module.exports = {
  ASPECT_RATIO_SCHEMA,
  GENERATION_MODE_SCHEMA,
  validateAspectRatio,
  validateGenerationMode,
  validateGenerationParams
};
