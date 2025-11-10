import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ProfessorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="flex overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfessorLayout;

