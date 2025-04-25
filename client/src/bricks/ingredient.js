import React from 'react';
import Card from 'react-bootstrap/Card';

function Ingredient(props) {
    return (
        <Card>
            <Card.Body>
                <div style={{ textAlign: "center", fontWeight: "bold" }}>
                    {props.ingredient.name}
                </div>

                <div>
                    Amount: {" "} {props.ingredient.amountValue} {" "}
                    {props.ingredient.amountUnit}
                </div>
            </Card.Body>
        </Card>
    )
}

export default Ingredient;