import IngredientList from '../bricks/ingredientList';
import Button from 'react-bootstrap/Button';
import IngredientForm from '../bricks/ingredientForm';
import { useEffect, useState } from 'react';

function IngredientSection() {
    const [ingredientListCall, setIngredientListCall] = useState({ state: "pending" });
    const [reload, setReload] = useState(false);
    const [addIngredientShow, setAddIngredientShow] = useState(false);

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
        setReload(false);
    }, [reload]);

    const handleAddIngredientShow = () => {
        setAddIngredientShow(true);
    };

    const handleIngredientAdded = (ingredient) => {
        if (ingredientListCall.state === "success") {
            setIngredientListCall({
                state: "success",
                data: [...ingredientListCall.data, ingredient]
            });
        }
    };

    return (
        <>
            <div className="Ingredient-form-button">
                <Button variant="success" onClick={handleAddIngredientShow}>
                    Create
                </Button>
            </div>
            <div>
                {ingredientListCall.state === "pending" && <p>Loading...</p>}
                {ingredientListCall.state === "error" && (
                    <p>{ingredientListCall.error}</p>
                )}
                {ingredientListCall.state === "success" && ingredientListCall.data.length > 0 && (
                    <IngredientList ingredientList={ingredientListCall.data} />
                )}
                {ingredientListCall.state === "success" && ingredientListCall.data.length === 0 && (
                    <p>There are no ingredients.</p>
                )}
            </div>

            <IngredientForm
                show={addIngredientShow}
                setAddIngredientShow={setAddIngredientShow}
                reload={reload}
                setReload={setReload}
                onComplete={(ingredient) => handleIngredientAdded(ingredient)}
                ingredientListCall={ingredientListCall}
                setIngredientListCall={setIngredientListCall}
            />
        </>
    );
}

export default IngredientSection;