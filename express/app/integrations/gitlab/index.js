const { getBaseSHA } = require('./mergeRequest');
const {
  snapshotsPending,
  snapshotsNeedApproving,
  snapshotsNoDiffs,
  snapshotsApproved,
} = require('./status');

module.exports = {
  getBaseSHA,
  snapshotsPending,
  snapshotsNeedApproving,
  snapshotsNoDiffs,
  snapshotsApproved,
};