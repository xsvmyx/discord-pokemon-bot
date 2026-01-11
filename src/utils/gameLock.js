const activeGamesByChannel = new Map();

/**
 * @returns {boolean} true si lock posé, false si déjà occupé
 */
function lockChannel(channelId, data = {}) {
  if (activeGamesByChannel.has(channelId)) return false;

  activeGamesByChannel.set(channelId, {
    ...data,
    startedAt: Date.now()
  });

  return true;
}

function unlockChannel(channelId) {
  activeGamesByChannel.delete(channelId);
}

function isLocked(channelId) {
  return activeGamesByChannel.has(channelId);
}

function getLock(channelId) {
  return activeGamesByChannel.get(channelId);
}




module.exports = {
  lockChannel,
  unlockChannel,
  isLocked,
  getLock
};
