exports.up = async function(knex, Promise) {
  await knex.schema.table('project', table => {
    table.renameColumn('provider', 'scm_provider');
    table.json('scm_config');
    table.renameColumn('repo_active', 'scm_active');
    table.renameColumn('repo_token', 'scm_token');
  });
  const projects = await knex('project')
    .select(['id', 'repo_owner', 'repo_name'])
    .whereNotNull('repo_owner')
    .orWhereNotNull('repo_name');
  for await (const project of projects) {
    const scmConfig = {
      repoOwner: project.repo_owner,
      repoName: project.repo_name,
    };

    await knex('project')
      .where('id', project.id)
      .update({
        scm_config: JSON.stringify(scmConfig),
      });
  }
  await knex.schema.table('project', table => {
    table.dropColumn('repo_owner');
    table.dropColumn('repo_name');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('project', table => {
    table.string('repo_owner');
    table.string('repo_name');
  });
  const projects = await knex
    .table('project')
    .select(['id', 'scm_config', 'scm_provider'])
    .where('scm_provider', 'github')
    .andWhereNot('scm_config', null);
  for await (const project of projects) {
    if (project.scm_config) {
      await knex('project')
        .where('id', project.id)
        .update({
          repo_owner: project.scm_config.repoOwner,
          repo_name: project.scm_config.repoName,
        });
    }
  }
  await knex.schema.table('project', table => {
    table.renameColumn('scm_provider', 'provider');
    table.dropColumn('scm_config');
    table.renameColumn('scm_active', 'repo_active');
    table.renameColumn('scm_token', 'repo_token');
  });
};
