'use strict';

function t(key, vars = {}) {
  const catalog = {
    'purchases.subscribe_header': 'Choose a tier:\n',
    'purchases.tier_line': (v) => `• ${v.name}: ${v.stars} stars (${v.cmd})\n`,
    'purchases.subscribe_footer': '\nReply with /subscribe <tier>'
  };
  const entry = catalog[key];
  if (typeof entry === 'function') {
    return entry(vars);
  }
  return entry ?? key;
}

module.exports = { t };
