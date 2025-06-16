import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  key,
  ...props
}) => {
  const classes = [
    'bg-white dark:bg-gray-700 rounded-lg shadow-md p-6',
    className,
  ].join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  key: PropTypes.string,
};

export default Card; 