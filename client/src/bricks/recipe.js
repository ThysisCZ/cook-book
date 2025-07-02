import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiPencilBox } from '@mdi/js';
import { useState } from 'react';
import RecipeEditForm from '../bricks/recipeEditForm';

function Recipe(props) {
    const ingredientList = props.ingredientListCall?.state === "success" ? props.ingredientListCall.data : [];
    const recipeList = props.recipeListCall?.state === "success" ? props.recipeListCall.data : [];
    // Image is already a data URL in both mobile and web environments
    const imageUrl = props.recipe.image;
    const navigate = useNavigate();
    const [editRecipeShow, setEditRecipeShow] = useState(false);

    const handleEditRecipeShow = () => {
        setEditRecipeShow(true);
    };

    const handleRecipeEdited = (updatedRecipe) => {
        if (props.recipeListCall?.state === "success") {
            //find recipe that was updated and force a state update
            const updatedList = [...recipeList];
            const index = updatedList.findIndex(rec => rec.id === updatedRecipe.id);
            if (index !== -1) {
                updatedList[index] = updatedRecipe;
                //display updated list with a new array reference to trigger re-render
                props.setRecipeListCall({
                    state: "success",
                    data: updatedList
                });
            }
        }
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <div style={{ fontWeight: "bold" }}>
                            {props.recipe.name}
                        </div>

                        <div>
                            <Icon
                                size={1}
                                style={{ color: "salmon" }}
                                path={mdiPencilBox}
                                onClick={handleEditRecipeShow}
                            ></Icon>
                        </div>
                    </div>

                    <div>
                        <div className="Align-right" style={{ marginRight: 24 }}>
                            <img src={imageUrl} alt={props.recipe.image} className="Image-container"></img>
                        </div>
                        <div className="Align-left" style={{ marginBottom: 10 }}>
                            <Button
                                variant="success"
                                onClick={() => navigate(`/recipe/${props.recipe.id}`)}>
                                Detail
                            </Button>
                        </div>
                    </div>

                    <div className="Align-left" style={{ fontWeight: "bold" }}>
                        {props.isCzech ? "Ingredience:" : "Ingredients:"}
                    </div>

                    <div>
                        {props.recipe.requiredIngredients.map((reqIng) => {
                            const match = ingredientList.find((favIng) => favIng.id === reqIng.id);
                            if (!match) return null;

                            return (
                                <div key={reqIng.id}>
                                    <div className="Align-left">
                                        {match.name}
                                    </div>
                                    <div className="Align-right">
                                        {props.isCzech ? "potřebujete " : ""}
                                        {reqIng.requiredAmountValue} {reqIng.requiredAmountUnit}
                                        {props.isCzech ? "" : " required"}
                                    </div>
                                    {match.amountValue !== 0 ? (
                                        <div className="Align-right">
                                            {props.isCzech ? "máte " : ""}
                                            {match.amountValue} {match.amountUnit}
                                            {props.isCzech ? "" : " available"}
                                        </div>
                                    ) : (
                                        <div className="Align-right">
                                            {props.isCzech ? "nedostupné" : "unavailable"}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>

            <RecipeEditForm
                show={editRecipeShow}
                setEditRecipeShow={setEditRecipeShow}
                onComplete={(recipe) => handleRecipeEdited(recipe)}
                recipeListCall={props.recipeListCall}
                ingredientListCall={props.ingredientListCall}
                recipe={props.recipe}
                isCzech={props.isCzech}
            />
        </>
    );
}

export default Recipe;