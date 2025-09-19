// components/Pagination.js
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
   currentPage,
   totalPages,
   totalItems,
   itemsPerPage,
   onPageChange,
   className = ''
}) => {
   const maxVisiblePages = 15;

   if (totalPages <= 1) return null;

   const startItem = (currentPage - 1) * itemsPerPage + 1;
   const endItem = Math.min(currentPage * itemsPerPage, totalItems);

   const getPageNumbers = () => {
      const pages = [];
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
         startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
         pages.push(i);
      }

      return pages;
   };

   return (
      <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
         {/* Mobile view */}
         <div className="flex flex-1 justify-between sm:hidden">
            <button
               onClick={() => onPageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Previous
            </button>
            <button
               onClick={() => onPageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Next
            </button>
         </div>

         {/* Desktop view */}
         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
               <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
               </p>
            </div>

            <div>
               <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  {/* Previous button */}
                  <button
                     onClick={() => onPageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <span className="sr-only">Previous</span>
                     <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((page) => (
                     <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                              ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                           }`}
                     >
                        {page}
                     </button>
                  ))}

                  {/* Next button */}
                  <button
                     onClick={() => onPageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <span className="sr-only">Next</span>
                     <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
               </nav>
            </div>
         </div>
      </div>
   );
};

export default Pagination;