import Card from 'react-bootstrap/Card';
import Icon from '@mdi/react';
import { mdiPencilBox } from '@mdi/js';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import IngredientEditForm from '../bricks/ingredientEditForm';

function Ingredient(props) {
    const { ingredientListCall, setIngredientListCall } = useOutletContext();
    const [editIngredientShow, setEditIngredientShow] = useState(false);

    const handleEditIngredientShow = () => {
        setEditIngredientShow(true);
    };

    const handleIngredientEdited = (updatedIngredient) => {
        if (ingredientListCall.state === "success") {
            //find ingredient that was updated
            const updatedList = ingredientListCall.data.map((ing) =>
                ing.id === updatedIngredient.id ? updatedIngredient : ing
            );

            //display updated list
            setIngredientListCall({
                state: "success",
                data: updatedList
            });
        }
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <div>
                            <Icon size={1}></Icon>
                        </div>

                        <div style={{ fontWeight: "bold" }}>
                            {props.ingredient.name}
                        </div>

                        <div>
                            <Icon
                                size={1}
                                style={{ color: "salmon" }}
                                path={mdiPencilBox}
                                onClick={handleEditIngredientShow}
                            >
                            </Icon>
                        </div>
                    </div>

                    <div>
                        {props.isCzech ? "Množství: " : "Amount: "}
                        {props.ingredient.amountValue} {" "}
                        {props.ingredient.amountUnit}
                    </div>
                </Card.Body>
            </Card>

            <IngredientEditForm
                show={editIngredientShow}
                setEditIngredientShow={setEditIngredientShow}
                onComplete={(ingredient) => handleIngredientEdited(ingredient)}
                ingredient={props.ingredient}
                ingredientListCall={ingredientListCall}
                isCzech={props.isCzech}
            />
        </>
    )
}

export default Ingredient;