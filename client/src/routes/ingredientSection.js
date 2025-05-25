import IngredientList from '../bricks/ingredientList';
import Button from 'react-bootstrap/Button';
import IngredientForm from '../bricks/ingredientForm';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';

function IngredientSection() {
    const { ingredientListCall, setIngredientListCall } = useOutletContext();
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

    return (
        <>
            <div className="Show-form-button">
                <Button variant="success" onClick={handleAddIngredientShow}>
                    Create
                </Button>
            </div>
            <div>
                {ingredientListCall.state === "pending" && (
                    <Icon size={2} path={mdiLoading} spin={true} />
                )}
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
                onComplete={(ingredient) => handleIngredientAdded(ingredient)}
                ingredientListCall={ingredientListCall}
                setIngredientListCall={setIngredientListCall}
            />
        </>
    );
}

export default IngredientSection;