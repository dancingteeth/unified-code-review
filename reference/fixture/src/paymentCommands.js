'use strict';

const { t } = require('./i18n');

const SUBSCRIPTION_TIERS = [
  { key: 'CREATOR', stars: 100, actions: 50 },
  { key: 'PRO', stars: 250, actions: 150 }
];

/**
 * Build the /subscribe help text when no tier argument is given.
 */
function buildSubscribeMessage() {
  let message = t('purchases.subscribe_header');
  for (const t of SUBSCRIPTION_TIERS) {
    const name = t.key.charAt(0) + t.key.slice(1).toLowerCase();
    const cmd = t.key.toLowerCase();
    message += t2('purchases.tier_line', { name, stars: t.stars, cmd });
  }
  message += t('purchases.subscribe_footer');
  return message;
}

module.exports = { buildSubscribeMessage };
