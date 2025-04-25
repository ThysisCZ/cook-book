import React from 'react';
import Recipe from './recipe';

function RecipeList(props) {
    return (
        <div className="row">
            {props.recipeList.map((recipe) => {
                return (
                    <div
                        key={recipe.id}
                        className="col-22 col-sm-10 col-md-6 col-lg-6 col-xl-4"
                        style={{ paddingBottom: "10px" }}
                    >
                        <Recipe recipe={recipe} ingredientListCall={props.ingredientListCall} />
                    </div>
                );
            })}
        </div>
    );
}

export default RecipeList;