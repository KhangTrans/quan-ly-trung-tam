import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Khung Dự Án React (Frontend)
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Dự án đã sẵn sàng với Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router và Axios.
      </p>
    </div>
  );
};
