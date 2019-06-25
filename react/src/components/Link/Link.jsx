import React, { PureComponent } from 'react';
import { Anchor, Button, RoutedButton } from 'grommet';
import styled from 'styled-components';

import { history } from '../../history.js';

const isLeftClickEvent = event => {
  return event.button === 0;
};

const isModifiedEvent = event => {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
};

const Normal = styled.a`
  text-decoration: none;
  color: inherit;
`;

const handleClick = (event, props) => {
  if (props.onClick) {
    props.onClick(event);
  }
  if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
    return;
  }

  if (event.defaultPrevented === true) {
    return;
  }
  event.preventDefault();
  history.push(event.currentTarget.getAttribute('href'));
};

export default class Link extends PureComponent {
  render() {
    return (
      <Anchor
        {...this.props}
        onClick={event => handleClick(event, this.props)}
      />
    );
  }
  static Normal(props) {
    return <Normal {...props} onClick={event => handleClick(event, props)} />;
  }
  static Button(props) {
    return <Button {...props} onClick={event => handleClick(event, props)} />;
  }
  static RoutedButton(props) {
    return (
      <RoutedButton {...props} onClick={event => handleClick(event, props)} />
    );
  }
}
