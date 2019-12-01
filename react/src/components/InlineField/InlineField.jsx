import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button, Form, TextInput } from 'grommet';
import { Edit, FormClose, FormCheckmark } from 'grommet-icons';

const InlineField = React.memo(
  ({ canChange, title, value, onSubmit, isUpdating, testId }) => {
    const [newValue, onChange] = useState(value || '');
    const [isEditing, onEdit] = useState(false);
    const handleSubmit = () => {
      onEdit(false);
      onSubmit(newValue);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onEdit(false);
        onChange(value || '');
      }
    };
    let children;
    if (!canChange) {
      children = <Text>{value}</Text>;
    } else if (isEditing) {
      children = (
        <Form onSubmit={handleSubmit}>
          <Box gap="small" direction="row">
            <Box width="medium" align="center">
              <TextInput
                data-test-id={`${testId}-input`}
                value={newValue}
                onChange={event => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </Box>
            <Box direction="row" gap="small" justify="end">
              <Button
                data-test-id={`${testId}-save`}
                disabled={isUpdating}
                type="submit"
              >
                <Box>
                  <FormCheckmark color="brand" />
                </Box>
              </Button>
              <Button
                data-test-id={`${testId}-cancel`}
                onClick={() => onEdit(false)}
                type="button"
              >
                <Box>
                  <FormClose />
                </Box>
              </Button>
            </Box>
          </Box>
        </Form>
      );
    } else {
      children = (
        <Button
          data-test-id={`edit-${testId}`}
          onClick={() => onEdit(true)}
          disabled={isUpdating}
        >
          <Box direction="row" gap="small" align="center">
            <Text>{value}</Text>
            <Edit color="brand" />
          </Box>
        </Button>
      );
    }
    return (
      <Box direction="row" justify="between" align="center">
        <Text margin={{ vertical: 'small' }}>{title}</Text>
        {children}
      </Box>
    );
  },
);

InlineField.propTypes = {
  canChange: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSubmit: PropTypes.func,
};

export default InlineField;
