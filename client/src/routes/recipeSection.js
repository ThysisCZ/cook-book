import RecipeList from '../bricks/recipeList';
import Button from 'react-bootstrap/Button';
import RecipeAddForm from '../bricks/recipeAddForm'
import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Icon from '@mdi/react';
import { mdiMagnify, mdiLoading } from '@mdi/js';
import { fetchApi } from '../services/api';

function RecipeSection() {
    const { ingredientListCall } = useOutletContext();
    const [recipeListCall, setRecipeListCall] = useState({ state: "pending" });
    const [addRecipeShow, setAddRecipeShow] = useState(false);
    //state that triggers an event in recipe list lifecycle after change
    const [searchBy, setSearchBy] = useState("");
    const [notFound, setNotFound] = useState(false);

    //prevents unnecessary recipe list rendering
    const recipeList = useMemo(() => {
        return recipeListCall.state === "success" ? recipeListCall.data : [];
    }, [recipeListCall.state, recipeListCall.data]);

    const ingredientList = useMemo(() => {
        return ingredientListCall.state === "success" ? ingredientListCall.data : [];
    }, [ingredientListCall.state, ingredientListCall.data]); useEffect(() => {
        async function fetchRecipes() {
            setRecipeListCall({ state: "pending" });

            try {
                const data = await fetchApi("recipes/list");
                setRecipeListCall({ state: "success", data });
            } catch (err) {
                setRecipeListCall({ state: "error", error: err.message });
            }
        }

        fetchRecipes();
    }, []);

    const handleAddRecipeShow = () => {
        setAddRecipeShow(true);
    };

    const handleRecipeAdded = (recipe) => {
        if (recipeListCall.state === "success") {
            setRecipeListCall({
                state: "success",
                data: [...recipeListCall.data, recipe]
            });
        }
    };

    //useMemo hook remembers a value and changes it during specific lifecycle events
    const filteredRecipeList = useMemo(() => {
        //prevent recipe list from disappearing when the search field is empty
        if (!searchBy) return recipeList;

        const items = searchBy.toLocaleLowerCase()
            //split search items with commas
            .split(",")
            //remove spaces
            .map(item => item.trim());

        return recipeList.filter((rec) => {
            //find a favourite ingredient name based on required ingredient ID
            const names = rec.requiredIngredients.map((reqIng) => {
                const match = ingredientList.find((favIng) => favIng.id === reqIng.id);
                return match ? match.name.toLocaleLowerCase() : "";
            });

            //check if any item in the search field matches any ingredient name
            return items.find((item) =>
                names.find((name) => name.includes(item))
            );
        });
        //useMemo reacts on the change of the searchBy state
    }, [searchBy, recipeList, ingredientList]);

    //function that gets triggered after the search button is clicked
    function handleSearch(e) {
        e.preventDefault();
        //value of searchBy state is changed -> function in useMemo hook is triggered
        setSearchBy(e.target["searchInput"].value);
    }

    //handle display logic for recipes that are not found
    useEffect(() => {
        if (!searchBy) {
            setNotFound(false);
        } else {
            //if the user typed in ingredients and the filtered list is empty
            if (filteredRecipeList.length === 0) {
                setNotFound(true);
            }
        }
    }, [searchBy, filteredRecipeList.length]);

    //function that gets triggered everytime the search input changes
    function handleSearchDelete(e) {
        if (!e.target.value) {
            setSearchBy("");
            setNotFound(false);
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between">
                <div>
                    <Form onSubmit={handleSearch}>
                        <div className="d-flex">
                            <div>
                                <Form.Control
                                    id="searchInput"
                                    style={{ width: 165, height: 40, fontSize: 13 }}
                                    maxLength={150}
                                    type="search"
                                    placeholder="Search by ingredients"
                                    aria-label="Search"
                                    onChange={handleSearchDelete}
                                />
                            </div>
                            <div style={{ margin: "0px 5px" }}>
                                <Button
                                    variant="outline-success"
                                    type="submit"
                                >
                                    <Icon size={1} path={mdiMagnify} />
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="Show-form-button">
                    <Button variant="success" onClick={handleAddRecipeShow}>
                        Create
                    </Button>
                </div>
            </div>
            <div>
                {recipeListCall.state === "pending" && (
                    <Icon size={2} path={mdiLoading} spin={true} />
                )}
                {recipeListCall.state === "error" && (
                    <p>{recipeListCall.error}</p>
                )}                {recipeListCall.state === "success" && recipeListCall.data.length > 0 && (
                    <RecipeList
                        recipeList={filteredRecipeList}
                        ingredientListCall={ingredientListCall}
                        recipeListCall={recipeListCall}
                        setRecipeListCall={setRecipeListCall}
                    />
                )}
                {recipeListCall.state === "success" && recipeListCall.data.length === 0 && (
                    <p>There are no recipes.</p>
                )}
                {notFound && recipeListCall.state === "success" && recipeListCall.data.length > 0 && (
                    <p>No recipes found.</p>
                )}
            </div>

            <RecipeAddForm
                show={addRecipeShow}
                setAddRecipeShow={setAddRecipeShow}
                onComplete={(recipe) => handleRecipeAdded(recipe)}
                recipeListCall={recipeListCall}
                ingredientListCall={ingredientListCall}
            />

            <Outlet />
        </>
    );
}

export default RecipeSection;