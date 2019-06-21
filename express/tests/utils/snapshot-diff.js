const SnapshotDiff = require('../../app/models/SnapshotDiff');

const createSnapshotDiff = (
  fromSnapshot,
  toSnapshot,
  build,
  args = {},
) => {
  return SnapshotDiff.query().insertAndFetch({
    snapshotFromId: fromSnapshot.id,
    snapshotToId: toSnapshot.id,
    organizationId: build.organizationId,
    ...args,
  });
};

module.exports = {
  createSnapshotDiff,
};
