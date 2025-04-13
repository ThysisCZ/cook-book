import React from 'react';
import Ingredient from './ingredient';

function IngredientList(props) {
    return (
        <div className="row">
            {props.ingredientList.map((ingredient) => {
                return (
                    <div
                        key={ingredient.id}
                        className="col-11 col-sm-5 col-md-3 col-lg-3 col-xl-2"
                        style={{ paddingBottom: "10px" }}
                    >
                        <Ingredient ingredient={ingredient} />
                    </div>
                );
            })}
        </div>
    );
}

export default IngredientList;