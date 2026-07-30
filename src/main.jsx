import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Shell } from './components/Shell.jsx';
import { TodayPage } from './pages/TodayPage.jsx';
import { PlanPage } from './pages/PlanPage.jsx';
import { RecipesPage } from './pages/RecipesPage.jsx';
import { PantryPage } from './pages/PantryPage.jsx';
import { GroceryPage } from './pages/GroceryPage.jsx';
import './index.css';

const routes = { '/': TodayPage, '/plan': PlanPage, '/recipes': RecipesPage, '/pantry': PantryPage, '/grocery': GroceryPage };
const readPath = () => { const path = window.location.hash.slice(1) || '/'; return routes[path] ? path : '/'; };

function App() {
  const [path, setPath] = useState(readPath);
  useEffect(() => { const update = () => setPath(readPath()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  const Page = routes[path];
  return <Shell currentPath={path}><Page /></Shell>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
