import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { Toaster } from "react-hot-toast";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
root.render(
  <>
    <Toaster position="top-right" />
    <App />
  </>
);