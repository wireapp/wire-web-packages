import PropTypes from 'prop-types';
import React from 'react';

const width = 28;
const height = 31;

function Team({color, scale}) {
  const scaledWidth = scale * width;
  const scaledHeight = scale * height;
  return (
    <svg width={`${scaledWidth}`} height={`${scaledHeight}`} viewBox="0 0 28 31">
      <path
        fill={color}
        d="M4.32 9.65V21.2l9.82 5.82 9.82-5.8V9.64l-9.82-5.82-9.82 5.82zM12.54.4c.9-.53 2.33-.53 3.2 0l10.3 6.1c.9.5 1.6 1.8 1.6 2.83v12.2c0 1.04-.72 2.32-1.6 2.84l-10.3 6.1c-.88.52-2.32.5-3.2 0l-10.3-6.1c-.88-.52-1.6-1.8-1.6-2.85V9.32c0-1.04.73-2.3 1.6-2.83L12.54.4z"
      />
    </svg>
  );
}

Team.propTypes = {
  color: PropTypes.string,
  scale: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Team.defaultProps = {
  color: '#000',
  scale: 1,
};

export {Team};
