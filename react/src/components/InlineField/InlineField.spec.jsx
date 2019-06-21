import React from 'react';

import InlineField from './InlineField.jsx';

import { render, fireEvent, cleanup } from 'react-testing-library';

afterEach(cleanup);

describe('<InlineField />', () => {
  const PROPS = {
    testId: 'inline',
    title: 'Person name',
    canChange: true,
    value: 'Billy bob',
    onSubmit: jest.fn(),
    isUpdating: false,
  };
  it('should render the text field', () => {
    const { getByTestId, queryByText } = render(<InlineField {...PROPS} />);
    expect(queryByText('Person name')).toBeDefined();
    expect(queryByText('Billy bob')).toBeDefined();
    const editButton = getByTestId('edit-inline');
    expect(editButton).toBeDefined();
    expect(editButton.getAttribute('disabled')).toBe(null);
  });
  it('should change to an edit state when clicked', () => {
    const { getByTestId } = render(<InlineField {...PROPS} />);
    const editButton = getByTestId('edit-inline');
    editButton.click();
    const input = getByTestId('inline-input');
    expect(input).toBeDefined();
    expect(input.value).toBe('Billy bob');
    fireEvent.change(input, { target: { value: 'Not billy bob' } });
    fireEvent.submit(input);
    expect(PROPS.onSubmit).toHaveBeenCalledWith('Not billy bob');
  });
  it('should allow you to cancel when editing', () => {
    const { getByTestId } = render(<InlineField {...PROPS} />);
    const editButton = getByTestId('edit-inline');
    editButton.click();
    const input = getByTestId('inline-input');
    expect(input).toBeDefined();
    fireEvent.change(input, { target: { value: 'Not billy bob' } });
    getByTestId('inline-cancel').click();
    expect(PROPS.onSubmit).not.toHaveBeenCalled();
  });
  it('should not allow editing when canChange is false', () => {
    const { queryByTestId } = render(
      <InlineField {...PROPS} canChange={false} />,
    );
    expect(queryByTestId('edit-inline')).toBe(null);
  });
  it('should not allow saving when already updating', () => {
    const { getByTestId, queryByTestId } = render(
      <InlineField {...PROPS} isUpdating={true} />,
    );
    const editButton = getByTestId('edit-inline');
    editButton.click();
    expect(queryByTestId('inline-input')).toBe(null);
    expect(editButton.getAttribute('disabled')).not.toBe(null);
  });
});
