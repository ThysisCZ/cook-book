import { useState, useEffect } from 'react';
import Sections from '../bricks/sections';

function Home() {
    const [ingredientListCall, setIngredientListCall] = useState({ state: "pending" });

    useEffect(() => {
        async function fetchIngredients() {
            setIngredientListCall({ state: "pending" });

            try {
                const res = await fetch("http://localhost:8000/ingredient/list");
                const data = await res.json();

                if (res.status >= 400) {
                    setIngredientListCall({ state: "error", error: data });
                } else {
                    setIngredientListCall({ state: "success", data });
                }
            } catch (err) {
                setIngredientListCall({ state: "error", error: err.message });
            }
        }

        fetchIngredients();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                Personal Recipe Manager
            </header>
            <header className="Dashboard-header">
                Dashboard
            </header>
            <div className="Section-container">
                <Sections ingredientListCall={ingredientListCall} setIngredientListCall={setIngredientListCall} />
            </div>
        </div>
    );
}

export default Home;