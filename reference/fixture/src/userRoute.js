'use strict';

const { getUser } = require('./getUser');

/**
 * HTTP-style handler: load user and return a greeting payload.
 * Callers expect getUser to throw when the user is missing.
 */
function handleUserRequest(userId) {
  try {
    const user = getUser(userId);
    return { status: 200, body: `Hello, ${user.name}` };
  } catch (err) {
    return { status: 404, body: 'User not found' };
  }
}

module.exports = { handleUserRequest };
