import React from 'react';

const Spinner = () => {
   return (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="animate-spin w-[65px] h-[65px] border-[5px] border-solid border-gray-700 border-t-blue-500 rounded-full"></div>
    </div>
  );
}

export default Spinner;
