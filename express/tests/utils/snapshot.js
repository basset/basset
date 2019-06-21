const Snapshot = require('../../app/models/Snapshot');

const createSnapshot = async (title, build, args = {}) => {
  return Snapshot.query().insertAndFetch({
    title,
    buildId: build.id,
    organizationId: build.organizationId,
    ...args,
  });
};

module.exports = {
  createSnapshot,
};
