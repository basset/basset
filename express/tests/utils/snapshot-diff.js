const SnapshotDiff = require('../../app/models/SnapshotDiff');
const SnapshotDiffCenter = require('../../app/models/SnapshotDiffCenter');

const createSnapshotDiff = (fromSnapshot, toSnapshot, build, args = {}) => {
  return SnapshotDiff.query().insertAndFetch({
    snapshotFromId: fromSnapshot.id,
    snapshotToId: toSnapshot.id,
    buildId: build.id,
    organizationId: build.organizationId,
    ...args,
  });
};

const createSnapshotDiffCenter = (snapshotDiff, build, args = {}) => {
  return SnapshotDiffCenter.query().insertAndFetch({
    snapshotDiffId: snapshotDiff.id,
    buildId: build.id,
    organizationId: snapshotDiff.organizationId,
    ...args,
  })
};

module.exports = {
  createSnapshotDiff,
  createSnapshotDiffCenter
};
