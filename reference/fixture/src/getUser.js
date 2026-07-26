'use strict';

/**
 * Fetch a user by id from the backing store.
 * @param {string} userId
 * @returns {object|null} User record, or null when not found.
 */
function getUser(userId) {
  const users = {
    u1: { id: 'u1', name: 'Ada', tier: 'pro' }
  };
  return users[userId] ?? null;
}

module.exports = { getUser };
