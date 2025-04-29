import RecipeList from '../bricks/recipeList';
import Button from 'react-bootstrap/Button';
import RecipeForm from '../bricks/recipeForm'
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function RecipeSection() {
    const { ingredientListCall } = useOutletContext();
    const [recipeListCall, setRecipeListCall] = useState({ state: "pending" });
    const [addRecipeShow, setAddRecipeShow] = useState(false);

    useEffect(() => {
        async function fetchRecipes() {
            setRecipeListCall({ state: "pending" });

            try {
                const res = await fetch("http://localhost:8000/recipe/list");
                const data = await res.json();

                if (res.status >= 400) {
                    setRecipeListCall({ state: "error", error: data });
                } else {
                    setRecipeListCall({ state: "success", data });
                }
            } catch (err) {
                setRecipeListCall({ state: "error", error: err.message });
            }
        }

        fetchRecipes();
    }, []);

    const handleAddRecipeShow = () => {
        setAddRecipeShow(true);
    };

    const handleRecipeAdded = (recipe) => {
        if (recipeListCall.state === "success") {
            setRecipeListCall({
                state: "success",
                data: [...recipeListCall.data, recipe]
            });
        }
    };

    return (
        <>
            <div className="Show-form-button">
                <Button variant="success" onClick={handleAddRecipeShow}>
                    Create
                </Button>
            </div>
            <div>
                {recipeListCall.state === "pending" && <p>Loading...</p>}
                {recipeListCall.state === "error" && (
                    <p>{recipeListCall.error}</p>
                )}
                {recipeListCall.state === "success" && recipeListCall.data.length > 0 && (
                    <RecipeList recipeList={recipeListCall.data} ingredientListCall={ingredientListCall} />
                )}
                {recipeListCall.state === "success" && recipeListCall.data.length === 0 && (
                    <p>There are no recipes.</p>
                )}
            </div>

            <RecipeForm
                show={addRecipeShow}
                setAddRecipeShow={setAddRecipeShow}
                onComplete={(recipe) => handleRecipeAdded(recipe)}
                recipeListCall={recipeListCall}
                ingredientListCall={ingredientListCall}
            />

            <Outlet />
        </>
    );
}

export default RecipeSection;