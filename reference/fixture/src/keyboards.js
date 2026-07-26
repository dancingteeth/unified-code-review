'use strict';

/** Aspect ratios offered in the generation UI. */
const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '9:16', '16:9'];

/** Generation modes shown in the mode picker (uppercase in app state). */
const GENERATION_MODES = ['FAST', 'STANDARD', 'HD', 'VECTOR', 'VECTOR_FAST'];

function createAspectRatioKeyboard() {
  return ASPECT_RATIOS.map((ratio) => ({ text: ratio, callback_data: `ratio:${ratio}` }));
}

function createGenerationModeKeyboard() {
  return GENERATION_MODES.map((mode) => ({ text: mode, callback_data: `mode:${mode}` }));
}

module.exports = {
  ASPECT_RATIOS,
  GENERATION_MODES,
  createAspectRatioKeyboard,
  createGenerationModeKeyboard
};
