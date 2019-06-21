import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Drop, Text, ThemeContext, Heading } from 'grommet';

const UnderlinedText = styled(Text)`
  border-bottom: 2px dashed ${props => props.theme.global.colors['dark-2']};
`;

const UnderlinedHeading = styled(Heading)`
  border-bottom: 2px dashed ${props => props.theme.global.colors['dark-2']};
`;

export default class Tooltip extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
    debounce: PropTypes.number,
  };

  static defaultProps = {
    children: null,
    debounce: 250,
  };

  state = {
    show: false,
  };

  ref = React.createRef();

  left = false;
  timerId = null;

  componentWillUnmount() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  handleMouseEnter = () => {
    if (this.timerId !== null) {
      return;
    }
    this.left = false;
    this.timerId = setTimeout(() => {
      if (!this.state.show && !this.left) {
        this.setState({
          show: true,
        });
      }
      this.timerId = null;
    }, this.props.debounce);
  };

  handleMouseLeave = () => {
    this.left = true;
    if (this.state.show) {
      this.setState({
        show: false,
      });
    }
  };

  renderLabel() {
    if (
      typeof this.props.label === 'string' &&
      this.props.label.trim() !== ''
    ) {
      return (
        <Box pad="small" background="dark-1">
          <Text size="small">{this.props.label}</Text>
        </Box>
      );
    }
    return this.props.label;
  }

  render() {
    return (
      <React.Fragment>
        <Box
          data-test-id="tooltip"
          ref={this.ref}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.props.children}
        </Box>
        {this.state.show && (
          <Drop
            align={{ top: 'bottom', left: 'left' }}
            target={this.ref.current}
          >
            {this.renderLabel()}
          </Drop>
        )}
      </React.Fragment>
    );
  }

  static UnderlinedText = props => {
    return (
      <ThemeContext.Consumer>
        {theme => <UnderlinedText theme={theme} {...props} />}
      </ThemeContext.Consumer>
    );
  };

  static UnderlinedHeading = props => {
    return (
      <ThemeContext.Consumer>
        {theme => <UnderlinedHeading theme={theme} {...props} />}
      </ThemeContext.Consumer>
    );
  };

  static UnderlinedComponent = props => {
    const Underlined = styled(props.component)`
      border-bottom: 2px dashed ${props => props.theme.global.colors['dark-2']};
    `;
    return (
      <ThemeContext.Consumer>
        {theme => <Underlined theme={theme} {...props} />}
      </ThemeContext.Consumer>
    );
  };
}
