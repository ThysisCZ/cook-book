import Recipe from './recipe';

function RecipeList(props) {
    return (
        <div className="row">
            {props.recipeList.map((recipe) => {
                return (
                    <div
                        key={recipe.id}
                        className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-4"
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