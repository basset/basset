const { getBaseSHA } = require('./pullRequest');
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