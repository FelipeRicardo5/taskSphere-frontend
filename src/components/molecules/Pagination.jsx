import React from 'react';
import Button from '../atoms/Button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        size="sm"
      >
        Anterior
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'secondary'}
          onClick={() => onPageChange(page)}
          size="sm"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        size="sm"
      >
        Próxima
      </Button>
    </div>
  );
};

export default Pagination; 