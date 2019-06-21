module.exports = async () => {
  try {
    await global.proc.destroy();
    await global.knex.migrate.rollback();
    await global.knex.destroy();
    await global.snapshots.submit();
    await global.snapshots.cleanUp();
  } catch (error) {
    await global.snapshots.cleanUp();
    console.error(error);
    throw error;
  }
};
