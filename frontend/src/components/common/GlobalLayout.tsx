import Navbar from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';
import { ScrollToTopButton } from './ScrollToTopButton';
import { Outlet } from 'react-router-dom';

const GlobalLayout: React.FC = () => (
  <>
    <Navbar />
    <Breadcrumbs />
    <Outlet />
    <ScrollToTopButton />
  </>
);

export default GlobalLayout;