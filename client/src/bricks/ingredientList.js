import Ingredient from './ingredient';

function IngredientList(props) {
    return (
        <div className="row">
            {props.ingredientList.map((ingredient) => {
                return (
                    <div
                        key={ingredient.id}
                        className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2"
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