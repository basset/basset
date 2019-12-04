const { getBaseSHA } = require('./mergeRequest');
const {
  snapshotsPending,
  snapshotsNeedApproving,
  snapshotsNoDiffs,
  snapshotsApproved,
  snapshotsExceeded,
} = require('./status');

module.exports = {
  getBaseSHA,
  snapshotsPending,
  snapshotsNeedApproving,
  snapshotsNoDiffs,
  snapshotsApproved,
  snapshotsExceeded,
};
