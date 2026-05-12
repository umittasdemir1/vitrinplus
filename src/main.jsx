import { createRoot } from 'react-dom/client';
import './styles.css';
import './services/firebase';
import StoreManagementApp from './App.jsx';

createRoot(document.getElementById('root')).render(<StoreManagementApp />);
