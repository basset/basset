import React from 'react';
import { Button, Layer } from 'grommet';
import { Up } from 'grommet-icons';

class ScrollUpButton extends React.PureComponent {
  state = {
    show: false,
  };

  componentDidMount() {
    document.addEventListener('scroll', this.handleScroll, true);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleScroll, true);
  }

  handleScroll = event => {
    if (event.target.scrollTop > 125) {
      this.setState({
        show: true,
      });
    } else {
      this.setState({
        show: false,
      });
    }
  };

  handleUp = () => {
    const el = document.getElementById('grommet');
    el.scrollTop = 0;
  };

  render() {
    if (!this.state.show) {
      return null;
    }
    return (
      <Layer
        position="bottom-right"
        plain
        modal={false}
        margin={{ right: 'medium' }}
        responsive={false}
      >
        <Button
          data-test-id="scroll-up"
          icon={<Up />}
          label="Top"
          onClick={this.handleUp}
        />
      </Layer>
    );
  }
}

export default ScrollUpButton;
