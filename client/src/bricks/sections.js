import Accordion from 'react-bootstrap/Accordion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function Sections() {
    const navigate = useNavigate();
    const location = useLocation();

    const activeSection = (() => {
        if (location.pathname.includes("recipeSection")) return "recipes";
        if (location.pathname.includes("ingredientSection")) return "ingredients";
        return null;
    })();

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
                        Recipes
                    </div>
                </Accordion.Header>
                {activeSection === "recipes" && (
                    <Accordion.Body>
                        <Outlet />
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
                        Ingredients
                    </div>
                </Accordion.Header>
                {activeSection === "ingredients" && (
                    <Accordion.Body>
                        <Outlet />
                    </Accordion.Body>
                )}
            </Accordion.Item>
        </Accordion>
    );
}

export default Sections;

