const runQuery = require('./run-query');
const Snapshots = require('../../../app/models/Snapshot');
const { createUser } = require('../../utils/user');
const {
  createOrganization,
  addUserToOrganization,
} = require('../../utils/organization');
const { createProject } = require('../../utils/project');
const { createBuild } = require('../../utils/build');
const { createSnapshot } = require('../../utils/snapshot');
const { createSnapshotDiff } = require('../../utils/snapshot-diff');

jest.mock('../../../app/utils/upload', () => ({
  copySnapshotDiffToFlake: jest.fn(() => 'imageLocation'),
}));

const upload = require('../../../app/utils/upload');

describe('snapshot schema', () => {
  let user, otherUser;
  let organization, otherOrganization;
  let project, project2, otherProject;
  let snapshot, snapshot2, otherSnapshot;
  let build, build2, otherBuild;

  beforeAll(async () => {
    user = await createUser('snapshot@organization.io');
    organization = await createOrganization('test');
    await addUserToOrganization(organization.id, user.id);
    otherUser = await createUser('snapshot@notorganization.io');
    otherOrganization = await createOrganization('test2');
    addUserToOrganization(otherOrganization.id, otherUser.id, true);
    project = await createProject('test', organization.id);
    project2 = await createProject('test', organization.id);
    otherProject = await createProject('test', otherOrganization.id);
    build = await createBuild('test', project);
    build2 = await createBuild('test', project2);
    otherBuild = await createBuild('test', otherProject);
    snapshot = await createSnapshot('test', build, { diff: true });
    snapshot2 = await createSnapshot('test1', build2, { diff: true });
    otherSnapshot = await createSnapshot('test2', otherBuild);
  });
  afterAll(async () => {
    await user.$query().delete();
    await organization.$query().delete();
    await otherUser.$query().delete();
    await otherOrganization.$query().delete();
  });

  describe('query', async () => {
    test('can get snapshots by build', async () => {
      const query = `
        query snapshots($first: Int!, $buildId: ID!) {
          snapshots(first: $first, buildId: $buildId) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      const variables = {
        first: 100,
        buildId: build.id,
      };
      const result = await runQuery(query, user, variables);
      expect(result.data.snapshots.edges.length).toBe(1);
      expect(result.data.snapshots.edges[0].node.id).toBe(snapshot.id);
    });

    test('get snapshots', async () => {
      const query = `
        query snapshot($snapshotId: ID!) {
          snapshot(id: $snapshotId) {
            id
          }
        }
      `;
      const variables = {
        snapshotId: snapshot.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.errors).toBeUndefined();
      expect(result.data.snapshot.id).toBe(snapshot.id);
    });

    test('cannot get snapshot your organization does not own', async () => {
      const query = `
        query snapshot($snapshotId: ID!) {
          snapshot(id: $snapshotId) {
            id
          }
        }
      `;
      const variables = {
        first: 100,
        snapshotId: otherSnapshot.id,
      };

      const result = await runQuery(query, user, variables);
      expect(result.data.snapshot).toBe(null);
    });
    test('search by title', async () => {
      const query = `
      query snapshots($first: Int!, $buildId: ID!, $title: String) {
        snapshots(first: $first, buildId: $buildId, title: $title) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
      const variables = {
        first: 100,
        buildId: build.id,
        title: 'te',
      };
      let result = await runQuery(query, user, variables);
      expect(result.data.snapshots.edges.length).toBe(1);
      expect(result.data.snapshots.edges[0].node.id).toBe(snapshot.id);

      variables.title = 'nottest';
      result = await runQuery(query, user, variables);
      expect(result.data.snapshots.edges.length).toBe(0);
    });
    test('get snapshots by group', async () => {
      const oldBuild = await createBuild('test', project);
      const oldSnapshots = [
        await createSnapshot('test 1', oldBuild),
        await createSnapshot('test 2', oldBuild),
        await createSnapshot('test 3', oldBuild),
        await createSnapshot('test 4', oldBuild),
        await createSnapshot('test 5', oldBuild),
        await createSnapshot('test 6', oldBuild),
        await createSnapshot('test 7', oldBuild),
        await createSnapshot('test 8', oldBuild),
        await createSnapshot('test 9', oldBuild),
        await createSnapshot('test 10', oldBuild),
      ];
      const newBuild = await createBuild('test', project);
      const newSnapshots = [
        await createSnapshot('test 1', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[0].id,
        }),
        await createSnapshot('test 2', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[1].id,
        }),
        await createSnapshot('test 3', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[2].id,
        }),
        await createSnapshot('test 4', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[3].id,
        }),
        await createSnapshot('test 5', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[4].id,
        }),
        await createSnapshot('test 6', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[5].id,
        }),
        await createSnapshot('test 7', newBuild, {
          approved: true,
          diff: true,
          previousApprovedId: oldSnapshots[6].id,
        }),
        await createSnapshot('test 8', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[7].id,
        }),
        await createSnapshot('test 9', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[8].id,
        }),
        await createSnapshot('test 10', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshots[9].id,
        }),
      ];
      const snapshotDiffs = [
        await createSnapshotDiff(oldSnapshots[0], newSnapshots[0], newBuild, {
          group: 1,
        }),
        await createSnapshotDiff(oldSnapshots[1], newSnapshots[1], newBuild, {
          group: 1,
        }),
        await createSnapshotDiff(oldSnapshots[2], newSnapshots[2], newBuild, {
          group: 3,
        }),
        await createSnapshotDiff(oldSnapshots[3], newSnapshots[3], newBuild, {
          group: 3,
        }),
        await createSnapshotDiff(oldSnapshots[4], newSnapshots[4], newBuild, {
          group: 2,
        }),
        await createSnapshotDiff(oldSnapshots[5], newSnapshots[5], newBuild, {
          group: 2,
        }),
        await createSnapshotDiff(oldSnapshots[6], newSnapshots[6], newBuild, {
          group: 2,
        }),
        await createSnapshotDiff(oldSnapshots[7], newSnapshots[7], newBuild, {
          group: null,
        }),
        await createSnapshotDiff(oldSnapshots[8], newSnapshots[8], newBuild, {
          group: null,
        }),
        await createSnapshotDiff(oldSnapshots[9], newSnapshots[9], newBuild, {
          group: null,
        }),
      ];
      const query = `
      query modifiedSnapshotGroups($first: Int, $after: String, $buildId: ID!, $limit: Int!, $offset: Int!) {
        modifiedSnapshotGroups(limit: $limit, offset: $offset, buildId: $buildId) {
          totalCount
          edges {
            node {
              approvedSnapshots
              group
              snapshots(first: $first, after: $after) {
                totalCount
                pageInfo {
                  hasNextPage
                }
                edges {
                  cursor
                  node {
                    id
                    imageLocation
                    approved
                    approvedOn
                    title
                    width
                    browser
                    diff
                    approvedBy {
                      user {
                        id
                        name
                      }
                    }
                    previousApproved {
                      id
                      imageLocation
                      approved
                      approvedOn
                      approvedBy {
                        user {
                          id
                          name
                        }
                      }
                    }
                    snapshotDiff {
                      snapshotFromId
                      snapshotToId
                      imageLocation
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
      const variables = {
        limit: 100,
        offset: 0,
        first: 25,
        buildId: newBuild.id,
      };
      let result = await runQuery(query, user, variables);
      const groups = result.data.modifiedSnapshotGroups;
      expect(groups.totalCount).toBe(4);
      const groupOne = groups.edges.find(edge => edge.node.group === 1);
      expect(groupOne.node.snapshots.totalCount).toBe(2);
      expect(groups.totalCount).toBe(4);
      const groupTwo = groups.edges.find(edge => edge.node.group === 2);
      expect(groupTwo.node.snapshots.totalCount).toBe(3);
      expect(groupTwo.node.approvedSnapshots).toBe(1);
      const groupNull = groups.edges.find(edge => edge.node.group === null);
      expect(groupNull.node.snapshots.totalCount).toBe(3);
    });
  });

  describe('mutation', () => {
    describe('addSnapshotFlake', () => {
      test('can create snapshot flake', async () => {
        const newSnapshot = await createSnapshot('test 1', build, {
          diff: true,
          previousApprovedId: snapshot.id,
        });
        await createSnapshotDiff(snapshot, newSnapshot, build, { group: 1 });
        const query = `
        mutation addSnapshotFlake($id: ID!) {
          addSnapshotFlake(id: $id) {
            id
            imageLocation
            createdBy {
              user {
                id
              }
            }
          }
        }
        `;
        const variables = {
          id: newSnapshot.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.addSnapshotFlake.imageLocation).toBe(
          'imageLocation',
        );
        expect(result.data.addSnapshotFlake.createdBy.user.id).toBe(user.id);
        expect(upload.copySnapshotDiffToFlake).toHaveBeenCalled();
      });
    });

    describe('approveSnapshot', () => {
      test('can approve snapshot', async () => {
        const query = `
          mutation approveSnapshot($id: ID!) {
            approveSnapshot(id: $id) {
              id
              approved
              approvedBy {
                user {
                  id
                }
              }
              approvedOn
            }
          }
        `;
        const variables = {
          id: snapshot.id,
        };
        const result = await runQuery(query, user, variables);
        expect(result.data.approveSnapshot.approved).toBe(true);
        expect(result.data.approveSnapshot.approvedBy.user.id).toBe(user.id);
        expect(result.data.approveSnapshot.approvedOn).toBeDefined();
      });
      test('approving last snapshot verifies the build', async () => {
        const query = `
          mutation approveSnapshot($id: ID!) {
            approveSnapshot(id: $id) {
              id
            }
          }
        `;
        let newBuild = await createBuild('tester', project);
        const newSnapshot = await createSnapshot('test', newBuild, {
          diff: true,
        });
        const variables = {
          id: newSnapshot.id,
        };
        await runQuery(query, user, variables);
        newBuild = await newBuild.$query();
        expect(newBuild.buildVerified).toBe(true);
      });
      test('cannot approve snapshot that has been set as a flake', async () => {
        const newSnapshot = await createSnapshot('test 1', build, {
          diff: true,
          previousApprovedId: snapshot.id,
        });
        await createSnapshotDiff(snapshot, newSnapshot, build, { group: 1 });
        const flakeQuery = `
        mutation addSnapshotFlake($id: ID!) {
          addSnapshotFlake(id: $id) {
            id
            imageLocation
            createdBy {
              user {
                id
              }
            }
          }
        }
        `;
        const variables = {
          id: newSnapshot.id,
        };
        await runQuery(flakeQuery, user, variables);
        const query = `
          mutation approveSnapshot($id: ID!) {
            approveSnapshot(id: $id) {
              id
            }
          }
        `;
        const result = await runQuery(query, user, variables);
        expect(
          result.errors.some(
            e =>
              e.message ===
              'This snapshot has already been set as a flake, you cannot approve it.',
          ),
        ).toBe(true);
      });
    });

    describe('approveSnapshots', () => {
      let query;
      beforeAll(() => {
        query = `
          mutation approveSnapshots($buildId: ID!) {
            approveSnapshots(buildId: $buildId)
          }
        `;
      });
      test('can approve snapshots already approved', async () => {
        const variables = {
          buildId: build.id,
        };

        const result = await runQuery(query, user, variables);
        expect(result.data.approveSnapshots).toEqual(true);
      });

      test('can approve snapshots', async () => {
        const variables = {
          buildId: build2.id,
        };

        const result = await runQuery(query, user, variables);
        expect(result.data.approveSnapshots).toEqual(true);
        const approvedSnapshots = await Snapshots.query()
          .where('buildId', build2.id)
          .where('approved', true)
          .eager('approvedBy.user');
        expect(approvedSnapshots).toHaveLength(1);
        expect(approvedSnapshots[0].id).toBe(snapshot2.id);
        expect(approvedSnapshots[0].approvedBy.user.id).toBe(user.id);
        expect(approvedSnapshots[0].approvedOn).toBeDefined();
      });

      test('does not approve snapshots that have been set as a flake', async () => {
        const oldBuild = await createBuild('oldBuild', project);
        const oldSnapshot = await createSnapshot('old snapshot', oldBuild);
        const newBuild = await createBuild('newBuild', project);
        const newSnapshot = await createSnapshot('test 1', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshot.id,
        });
        await createSnapshotDiff(oldSnapshot, newSnapshot, newBuild, { group: 1 });
        const flakeQuery = `
        mutation addSnapshotFlake($id: ID!) {
          addSnapshotFlake(id: $id) {
            id
            imageLocation
            createdBy {
              user {
                id
              }
            }
          }
        }
        `;
        let variables = {
          id: newSnapshot.id,
        };
        await runQuery(flakeQuery, user, variables);
        variables = {
          buildId: newBuild.id,
          group: 1,
        };
        await runQuery(query, user, variables);
        const approvedSnapshots = await Snapshots.query()
          .joinRelation('snapshotDiff')
          .where('snapshot.buildId', newBuild.id)
          .where('snapshotDiff.group', 1)
          .where('approved', true)
          .eager('approvedBy.user');
        expect(approvedSnapshots).toHaveLength(0);
        const totalSnapshots = await newBuild.$relatedQuery('snapshots');
        expect(totalSnapshots).toHaveLength(1);
      })
    });

    describe('approveGroupSnapshots', () => {
      let query;
      beforeAll(() => {
        query = `
          mutation approveGroupSnapshots($buildId: ID!, $group: Int!) {
            approveGroupSnapshots(buildId: $buildId, group: $group)
          }
        `;
      });
      test('can approve snapshots already approved', async () => {
        const newSnapshot = await createSnapshot('test 1', build, {
          diff: true,
          approved: true,
          previousApprovedId: snapshot.id,
        });
        await createSnapshotDiff(snapshot, newSnapshot, build, { group: 1 });
        const variables = {
          buildId: build.id,
          group: 1,
        };

        const result = await runQuery(query, user, variables);
        expect(result.data.approveGroupSnapshots).toEqual(true);
      });

      test('can approve snapshots', async () => {
        const newSnapshot = await createSnapshot('test 1', build2, {
          diff: true,
          previousApprovedId: snapshot2.id,
        });
        await createSnapshotDiff(snapshot, newSnapshot, build2, { group: 1 });
        const variables = {
          buildId: build2.id,
          group: 1,
        };

        const result = await runQuery(query, user, variables);
        expect(result.data.approveGroupSnapshots).toEqual(true);
        const approvedSnapshots = await Snapshots.query()
          .joinRelation('snapshotDiff')
          .where('snapshot.buildId', build2.id)
          .where('snapshotDiff.group', 1)
          .where('approved', true)
          .eager('approvedBy.user');
        expect(approvedSnapshots).toHaveLength(1);
        expect(approvedSnapshots[0].id).toBe(newSnapshot.id);
        expect(approvedSnapshots[0].approvedBy.user.id).toBe(user.id);
        expect(approvedSnapshots[0].approvedOn).toBeDefined();
      });
      test('does not approve snapshots that have been set as a flake', async () => {
        const oldBuild = await createBuild('oldBuild', project);
        const oldSnapshot = await createSnapshot('old snapshot', oldBuild);
        const newBuild = await createBuild('newBuild', project);
        const newSnapshot = await createSnapshot('test 1', newBuild, {
          diff: true,
          previousApprovedId: oldSnapshot.id,
        });
        await createSnapshotDiff(oldSnapshot, newSnapshot, newBuild, { group: 1 });
        const flakeQuery = `
        mutation addSnapshotFlake($id: ID!) {
          addSnapshotFlake(id: $id) {
            id
            imageLocation
            createdBy {
              user {
                id
              }
            }
          }
        }
        `;
        let variables = {
          id: newSnapshot.id,
        };
        await runQuery(flakeQuery, user, variables);
        variables = {
          buildId: build2.id,
          group: 1,
        };
        await runQuery(query, user, variables);
        const approvedSnapshots = await Snapshots.query()
          .joinRelation('snapshotDiff')
          .where('snapshot.buildId', newBuild.id)
          .where('snapshotDiff.group', 1)
          .where('approved', true)
          .eager('approvedBy.user');
        expect(approvedSnapshots).toHaveLength(0);
        const totalSnapshots = await newBuild.$relatedQuery('snapshots');
        expect(totalSnapshots).toHaveLength(1);
      });
    });
  });
});
