const paginateQuery = async (
  context,
  query,
  {
    before,
    after,
    first,
    last,
    orderByColumn = 'createdAt',
    orderBy = 'asc',
    orderByPrefix,
  } = {},
) => {
  const pageQuery = query.clone();

  if (first < 0) {
    throw new Error('first field must be greater than 0');
  }
  if (last < 0) {
    throw new Error('last field must be greater than 0');
  }

  if (first) {
    pageQuery.limit(first);
  }

  if (last) {
    orderBy = orderBy === 'asc' ? 'desc' : 'asc'; // reverse the order and limit, then we reverse the order later
    pageQuery.limit(last);
  }

  if (after || before) {
    const value = before || after;
    const { column, columnCursor, idColumn, idCursor } = getCursorValues(
      value,
      orderByPrefix,
      orderByColumn,
    );
    const op = before ? '<' : '>';
    pageQuery.where(column, op, columnCursor);
    if (value.includes(':')) {
      pageQuery.whereNot(idColumn, idCursor);
    }
  }

  pageQuery.orderBy(orderByColumn, orderBy);

  if (orderByColumn !== 'id') {
    pageQuery.orderBy('id');
  }
  const rows = await pageQuery;

  // let rows;
  // if (pageQuery._modelClass && pageQuery._modelClass.name && !skipLoader) {
  //   const Model = pageQuery._modelClass;
  //   const select = `${Model.tableName}.id`;
  //   const ids = await pageQuery.clone().select(select).map(item => item.id);
  //   const prop = `paginate${orderByPrefix}`
  //   rows = await getModelLoader(context, Model, { prop, loader: loaderFn(select, query), }).loadMany(ids);
  //   primeOthersLoaders(context, Model, prop, rows);
  // } else {
  //   rows = await pageQuery;
  // }
  return paginateResult(
    last ? rows.reverse() : rows,
    query,
    pageQuery,
    before,
    after,
    first,
    last,
    orderByColumn,
    orderBy,
    orderByPrefix,
  );
};

const paginateResult = (
  rows,
  originalQuery,
  pageQuery,
  before,
  after,
  first,
  last,
  orderByColumn,
  orderBy,
  orderByPrefix,
) => {
  return {
    edges: rows.map(row => ({
      cursor: createCursor(row, orderByColumn),
      node: row,
    })),
    totalCount: async () => {
      const count = await originalQuery
        .clone()
        .clearSelect()
        .count();
      let totalCount = 0;
      if (count.length > 0) {
        totalCount = count[0].count;
      }
      return totalCount;
    },
    pageInfo: {
      hasNextPage: async () => {
        if (rows.length < (last || first)) {
          return false;
        }
        const { column, idColumn } = getCursorValues(
          '',
          orderByPrefix,
          orderByColumn,
        );

        const lastRow = rows[rows.length - 1];
        let columnCursor = lastRow[orderByColumn];

        if (orderByColumn === 'createdAt' || orderByColumn === 'updatedAt') {
          columnCursor = columnCursor.toISOString();
        }

        const op = before ? '<' : '>';
        const nextQuery = pageQuery.clone();
        nextQuery
          .where(column, op, columnCursor)
          .whereNot(idColumn, lastRow.id);

        const row = await nextQuery.first();
        return !!row;
      },
      hasPreviousPage: async () => {
        const cursor = after || before;
        if (!!cursor === false) {
          return false;
        }
        if (before && rows.length < first) {
          return false;
        }
        const { column, columnCursor, idColumn, idCursor } = getCursorValues(
          cursor,
          orderByPrefix,
          orderByColumn,
        );
        const op = before ? '<' : '>';
        const columnValue = before ? rows[0][orderByColumn] : columnCursor;
        const idValue = before ? rows[0].id : idCursor;
        const prevQuery = pageQuery.clone();
        prevQuery.where(column, op, columnValue);
        if (idCursor) {
          prevQuery.whereNot(idColumn, idValue);
        }
        const rest = await prevQuery.first();
        return !!rest;
      },
    },
  };
};

const createCursor = (row, orderByColumn) => {
  const idCursor = Buffer.from(row.id).toString('base64');
  if (orderByColumn !== 'id') {
    const columnCursor = Buffer.from(
      row[orderByColumn].valueOf().toString(),
    ).toString('base64');
    return `${columnCursor}:${idCursor}`;
  }
  return idCursor;
};

const getCursorValues = (cursorValue, orderByPrefix, orderByColumn) => {
  const column = orderByPrefix
    ? `${orderByPrefix}.${orderByColumn}`
    : orderByColumn;
  const value = cursorValue.split(':');
  let columnCursor = Buffer.from(value[0], 'base64').toString();
  if (
    (orderByColumn === 'createdAt' || orderByColumn === 'updatedAt') &&
    cursorValue !== ''
  ) {
    columnCursor = getDate(columnCursor);
  }
  const idColumn = orderByPrefix ? `${orderByPrefix}.id` : 'id';
  let idCursor;
  if (value[1]) {
    idCursor = Buffer.from(value[1], 'base64').toString();
  }

  return {
    column,
    columnCursor,
    idColumn,
    idCursor,
  };
};

const getDate = value => new Date(parseInt(value, 10)).toISOString();

module.exports = {
  paginateQuery,
  createCursor,
};
