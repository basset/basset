import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import ProfileImage from './ProfileImage.jsx';

afterEach(cleanup);

describe('<ProfileImage />', () => {
  it('should render a profile image', () => {
    const PROPS = {
      user: {
        profileImage:
          'https://s3.amazonaws.com/uifaces/faces/twitter/aleksitappura/128.jpg',
      },
    };
    const { container, queryByText } = render(<ProfileImage {...PROPS} />);
    const divs = container.getElementsByTagName('div');
    expect(divs).toHaveLength(1);
    expect(queryByText('BM')).toBeNull();
  });
  it('should render with the name initials if there is no profileImage', () => {
    const PROPS = {
      user: {
        name: 'Billy McBilly',
      },
    };
    const { queryByText } = render(<ProfileImage {...PROPS} />);
    expect(queryByText('BM')).not.toBeNull();
  });
});
