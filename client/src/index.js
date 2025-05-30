import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from "./routes/home";
import IngredientSection from './routes/ingredientSection';
import RecipeSection from './routes/recipeSection';
import RecipeDetail from './routes/recipeDetail';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="" element={<Home />}>
            <Route path="ingredientSection" element={<IngredientSection />} />
            <Route path="recipeSection" element={<RecipeSection />} />
          </Route>
          <Route path="recipe/:id" element={<RecipeDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
