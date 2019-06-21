const getFieldNames = fieldNode => {
  let fields = [];
  for (selection of fieldNode.selectionSet.selections) {
    if (selection.name.kind === 'Name') {
      fields.push(selection.name.value);
    }
    if (selection.selectionSet) {
      fields = [...fields, ...getFieldNames(selection)];
    }
  }
  return fields;
};

module.exports = {
  getFieldNames,
};
