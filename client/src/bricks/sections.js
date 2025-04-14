import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import IngredientList from './ingredientList';
import IngredientForm from './ingredientForm';
import { useEffect, useState } from 'react';

function Sections() {
    const [ingredientListCall, setIngredientListCall] = useState({ state: "pending" });
    const [reload, setReload] = useState(false);

    const [addIngredientShow, setAddIngredientShow] = useState(false);

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

    return (
        <>
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <div style={{ fontWeight: "bold" }}>
                            Recipes
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                        <div style={{ fontWeight: "bold" }}>
                            Ingredients
                        </div>
                    </Accordion.Header>
                    <Accordion.Body style={{ paddingBottom: "6px" }}>
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <IngredientForm
                show={addIngredientShow}
                setAddIngredientShow={setAddIngredientShow}
                setReload={setReload}
                onComplete={(ingredient) => handleIngredientAdded(ingredient)}
            />
        </>
    );
}

export default Sections;

