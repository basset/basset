import React from 'react';
import styled from 'styled-components';

const Flake = ({ size, color="#666666" }) => {
  return (
    <svg
      version="1.1"
      viewBox="0 0 24 24"
      style={{ display: 'inline-block', width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
    >
      <path d="m22.026 1.975-1.6799-0.32479-6.5947 6.5947 2.0046 2.0046 6.5947-6.5947zm-13.781 11.776-6.5818 6.5818 0.31188 1.6928 1.6928 0.31188 6.5818-6.5818z" />
      <path d="m22.746 7.5069-0.58714 2.1912-4.9303-1.3211 0.5871-2.1912z" />
      <path d="m14.303 1.8428 2.1912-0.58714 1.3211 4.9303-2.1913 0.58718z" />
      <path d="m1.2542 16.495 0.58714-2.1912 4.9303 1.3211-0.5871 2.1912z" />
      <path d="m9.6966 22.159-2.1912 0.58714-1.3211-4.9303 2.1913-0.58718z" />
      <path d="m3.6678 1.6631-1.6928 0.31188-0.31188 1.6928 6.5818 6.5818 2.0046-2.0046zm12.088 12.088-2.0046 2.0046 6.5947 6.5947 1.6799-0.32479 0.32479-1.6799z" />
      <path d="m16.494 22.746-2.1912-0.58714 1.3211-4.9303 2.1912 0.5871z" />
      <path d="m22.158 14.303 0.58714 2.1912-4.9303 1.3211-0.58718-2.1913z" />
      <path d="m7.5062 1.2542 2.1912 0.58714-1.3211 4.9303-2.1912-0.5871z" />
      <path d="m1.8421 9.6966-0.58714-2.1912 4.9303-1.3211 0.58718 2.1913z" />
      <path d="m18.655 12-6.6548-6.6548-6.6548 6.6548 6.6548 6.6548zm-3.3274 0-3.3274 3.3274-3.3274-3.3274 3.3274-3.3274z" />
    </svg>
  );
};
Flake.defaultProps = {
  size: '24px',
};
export default Flake;
