import { React } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function Recipe(props) {
    const ingredientList = props.ingredientListCall.state === "success" ? props.ingredientListCall.data : [];
    const imageUrl = `http://localhost:8000/images/${props.recipe.image}`;
    const navigate = useNavigate();

    return (
        <Card>
            <Card.Body>
                <div className="Align-left" style={{ fontWeight: "bold" }}>
                    {props.recipe.name}
                </div>

                <div>
                    <span className="Align-right" style={{ marginRight: 24 }}>
                        <img src={imageUrl} alt={props.recipe.image} style={{ width: "150px", height: "auto" }}></img>
                    </span>
                    <span className="Align-left" style={{ marginBottom: 6 }}>
                        <Button variant="success" onClick={() => navigate(`/recipe/${props.recipe.id}`)}>
                            Detail
                        </Button>
                    </span>
                </div>

                <div className="Align-left" style={{ fontWeight: "bold" }}>
                    Ingredients:
                </div>

                <div>
                    {props.recipe.requiredIngredients.map((reqIng) => {
                        const match = ingredientList.find((favIng) => favIng.id === reqIng.id);
                        if (!match) return null;

                        return (
                            <div key={reqIng.id} className="d-flex justify-content-between">
                                <span>{match.name}</span>
                                <br></br>
                                <>{reqIng.requiredAmountValue} {reqIng.requiredAmountUnit} required</>
                                <br></br>
                                {match.amountValue !== 0 ? (
                                    <>{match.amountValue} {match.amountUnit} available</>
                                ) : (
                                    <>unavailable</>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card.Body>
        </Card>
    );
}

export default Recipe;