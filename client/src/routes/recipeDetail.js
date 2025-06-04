import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { Card, Button } from 'react-bootstrap';
import { fetchApi } from '../services/api';

function RecipeDetail() {
    const [recipeLoadCall, setRecipeLoadCall] = useState({
        state: "pending",
    });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadRecipe() {
            setRecipeLoadCall({ state: "pending" });

            try {
                const data = await fetchApi(`recipes/get?id=${id}`);
                setRecipeLoadCall({ state: "success", data });
            } catch (err) {
                setRecipeLoadCall({ state: "error", error: err.message });
            }
        }

        loadRecipe();
    }, [id]);

    function getChild() {
        switch (recipeLoadCall.state) {
            case "pending":
                return (
                    <div className="Align-center">
                        <Icon size={2} path={mdiLoading} spin={true} />
                    </div>
                );
            case "success":
                return (
                    <>
                        <Card>
                            <Card.Body>
                                <h1 className="Align-center">
                                    {recipeLoadCall.data.name}
                                </h1>
                                <h3>Preparation process:</h3>
                                <p style={{ textAlign: "justify" }}>
                                    {recipeLoadCall.data.preparationProcess}
                                </p>
                            </Card.Body>
                        </Card>

                        <div className="Show-form-button" style={{ margin: 16 }}>
                            <Button variant="success" onClick={() => navigate("/recipeSection")}>
                                Return
                            </Button>
                        </div>
                    </>
                );
            case "error":
                return (
                    <div>
                        <h3>Failed to load recipe data.</h3>
                        <pre>{JSON.stringify(recipeLoadCall.error, null, 2)}</pre>
                    </div>
                );
            default:
                return null;
        }
    }

    return getChild();
}

export default RecipeDetail;