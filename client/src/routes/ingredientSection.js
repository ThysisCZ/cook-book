import IngredientList from '../bricks/ingredientList';
import Button from 'react-bootstrap/Button';
import IngredientAddForm from '../bricks/ingredientAddForm';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useLanguage } from '../contexts/languageContext';

function IngredientSection() {
    const { ingredientListCall, setIngredientListCall } = useOutletContext();
    const { isCzech } = useLanguage();
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
                    {isCzech ? "Vytvořit" : "Create"}
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
                    <IngredientList
                        ingredientList={ingredientListCall.data}
                        isCzech={isCzech}
                    />
                )}
                {ingredientListCall.state === "success" && ingredientListCall.data.length === 0 && (
                    isCzech ? <p>Nejsou tu žádné ingredience.</p> : <p>There are no ingredients.</p>
                )}
            </div>

            <IngredientAddForm
                show={addIngredientShow}
                setAddIngredientShow={setAddIngredientShow}
                onComplete={(ingredient) => handleIngredientAdded(ingredient)}
                ingredientListCall={ingredientListCall}
                setIngredientListCall={setIngredientListCall}
                isCzech={isCzech}
            />
        </>
    );
}

export default IngredientSection;