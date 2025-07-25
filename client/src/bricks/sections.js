import Accordion from 'react-bootstrap/Accordion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';

function Sections(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const activeSection = (() => {
        if (location.pathname.includes("recipeSection")) return "recipes";
        if (location.pathname.includes("ingredientSection")) return "ingredients";
        return null;
    })();

    const [ingredientListCall, setIngredientListCall] = useState({ state: "pending" }); useEffect(() => {
        async function fetchIngredients() {
            setIngredientListCall({ state: "pending" });
            try {
                const data = await fetchApi("ingredient/list");
                setIngredientListCall({ state: "success", data });
            } catch (err) {
                setIngredientListCall({ state: "error", error: err.message });
            }
        }

        fetchIngredients();
    }, []);

    const isCzech = props.isCzech;

    return (
        <Accordion activeKey={activeSection}>
            <Accordion.Item eventKey="recipes">
                <Accordion.Header
                    onClick={() => {
                        if (activeSection === "recipes") {
                            navigate("/");
                        } else {
                            navigate("/recipeSection");
                        }
                    }}>
                    <div style={{ fontWeight: "bold" }}>
                        {isCzech ? "Recepty" : "Recipes"}
                    </div>
                </Accordion.Header>
                {activeSection === "recipes" && (
                    <Accordion.Body>
                        <Outlet context={{ ingredientListCall, isCzech }} />
                    </Accordion.Body>
                )}
            </Accordion.Item>
            <Accordion.Item eventKey="ingredients">
                <Accordion.Header
                    onClick={() => {
                        if (activeSection === "ingredients") {
                            navigate("/");
                        } else {
                            navigate("/ingredientSection");
                        }
                    }}>
                    <div style={{ fontWeight: "bold" }}>
                        {isCzech ? "Ingredience" : "Ingredients"}
                    </div>
                </Accordion.Header>
                {activeSection === "ingredients" && (
                    <Accordion.Body>
                        <Outlet context={{ ingredientListCall, setIngredientListCall, isCzech }} />
                    </Accordion.Body>
                )}
            </Accordion.Item>
        </Accordion>
    );
}

export default Sections;

