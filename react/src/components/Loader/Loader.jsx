import React from 'react';
import { Layer, Box } from 'grommet';
import styled from 'styled-components';

const AbsoluteBox = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`;

// Loader is by:
// < !--By Sam Herbert(@sherb), for everyone.More @http://goo.gl/7AJzbL -->

const Loader = React.memo(
  ({
    size = '45',
    color = '#2190eb',
    fill = false,
    delay = 250,
    margin = 'xlarge',
  }) => {
    const svg = (
      <svg
        data-test-id="loader"
        width={size}
        height={size}
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
            <stop stopColor={color} stopOpacity="0" offset="0%" />
            <stop stopColor={color} stopOpacity=".631" offset="63.146%" />
            <stop stopColor={color} offset="100%" />
          </linearGradient>
        </defs>
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)">
            <path
              d="M36 18c0-9.94-8.06-18-18-18"
              id="Oval-2"
              stroke="url(#a)"
              strokeWidth="2"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </path>
            <circle fill={color} cx="36" cy="18" r="1">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      </svg>
    );
    let children = <Box margin={{ vertical: margin }}>{svg}</Box>;

    if (fill) {
      children = (
        <AbsoluteBox fill data-test-id="loader-fill">
          <Box
            fill
            background="rgba(255,255,255,0.5)"
            align="center"
            justify="center"
          >
            {svg}
          </Box>
        </AbsoluteBox>
      );
    }
    return (
      <Box
        align="center"
        justify="center"
        animation={{ type: 'fadeIn', delay }}
      >
        {children}
      </Box>
    );
  },
);

export default Loader;
