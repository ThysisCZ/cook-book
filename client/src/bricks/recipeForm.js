import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { FileUpload } from 'primereact/fileupload';
import { useState, useEffect } from 'react';

function RecipeForm({ show, setAddRecipeShow, onComplete, recipeListCall, setRecipeListCall }) {
    const defaultForm = {
        name: "",
        image: "",
        preparationProcess: "",
        requiredIngredients: [
            {
                id: "",
                requiredAmountValue: null,
                requiredAmountUnit: "g"
            }
        ]
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [addRecipeCall, setAddRecipeCall] = useState({ state: "inactive" });

    const recipeList = recipeListCall.state === "success" ? recipeListCall.data : [];

    useEffect(() => {
        async function fetchRecipes() {
            setRecipeListCall({ state: "pending" });

            try {
                const res = await fetch("http://localhost:8000/recipe/list");
                const data = await res.json();

                if (res.status >= 400) {
                    setRecipeListCall({ state: "error", error: data });
                } else {
                    setRecipeListCall({ state: "success", data });
                }
            } catch (err) {
                setRecipeListCall({ state: "error", error: err.message });
            }
        }

        fetchRecipes();
    }, [setRecipeListCall]);

    const handleClose = () => {
        setFormData(defaultForm);
        setValidated(false);
        setAddRecipeShow(false);
    };

    const setField = (name, val) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async (e) => {
        const form = e.currentTarget;

        e.preventDefault();
        e.stopPropagation();

        const isDuplicate = recipeList.find((rec) => rec.name === formData.name);

        if (!form.checkValidity() || isDuplicate) {
            setValidated(true);
            return;
        }

        const payload = {
            ...formData
        };

        setAddRecipeCall({ state: "pending" });

        try {
            const res = await fetch(`http://localhost:8000/recipe/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.status >= 400) {
                setAddRecipeCall({ state: "error", error: data });
            } else {
                setAddRecipeCall({ state: "success", data });
                onComplete(data.recipe);
                handleClose();
            }
        } catch (err) {
            setAddRecipeCall({ state: "error", error: { errorMessage: err.message } });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Create Recipe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name<span style={{ color: "red" }}> *</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setField("name", e.target.value);
                                const isDuplicate = recipeList.find(
                                    (rec) => rec.name === e.target.value
                                );
                                e.target.setCustomValidity(isDuplicate ? "Duplicate" : "");
                            }}
                            maxLength={20}
                            required
                            isInvalid={
                                (validated && formData.name.length === 0) ||
                                recipeList.find((rec) => rec.name === formData.name)
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && "This field is required"}
                            {recipeList.find((rec) => rec.name === formData.name)
                                && "This recipe already exists"}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Image<span style={{ color: "red" }}> *</span></Form.Label>
                        <div>
                            <Button variant="success">
                                <FileUpload
                                    name="fileUpload"
                                    mode="basic"
                                    chooseLabel="Upload"
                                    url="/images"
                                    accept="image/*"
                                    maxFileSize={730000}
                                    onSelect={(e) => setField("image", e.files[0])}
                                />
                            </Button>
                        </div>
                        <div className="Invalid-feedback">
                            {validated && !formData.image && "Please upload an image"}
                        </div>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Preparation process<span style={{ color: "red" }}> *</span></Form.Label>
                        <textarea
                            name="preparationProcess"
                            style={{ width: 467, height: 100 }}
                            value={formData.preparationProcess}
                            onChange={(e) => setField("preparationProcess", e.target.value)}
                            maxLength={4000}
                            required
                            isInvalid={validated && formData.name.length === 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            This field is required
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Required ingredients<span style={{ color: "red" }}> *</span></Form.Label>
                        <Row>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label style={{ width: 200 }}>Name<span style={{ color: "red" }}> *</span></Form.Label>
                                <Form.Select
                                    style={{ width: 219 }}
                                    value={formData.requiredIngredients[0].id}
                                    onChange={(e) => setField("id", e.target.value)}
                                    required
                                    isInvalid={validated && !formData.requiredIngredients[0].id}
                                >
                                    <option value={""}></option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    There are no ingredients
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Value<span style={{ color: "red" }}> *</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    value={formData.requiredIngredients[0].requiredAmountValue}
                                    onChange={(e) => { setField("requiredAmountValue", parseFloat(e.target.value)); }}
                                    onBlur={(e) => {
                                        let value = e.target.value;
                                        if (value.length > 7) {
                                            e.target.value = value.slice(0, 7);
                                            setField("requiredAmountValue", parseFloat(e.target.value));
                                        }
                                    }}
                                    min={0.001}
                                    step={0.001}
                                    required
                                    isInvalid={validated && formData.amountValue < 0.001}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Input a valid number
                                    <br></br>
                                    (0,001—9999999)
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Unit<span style={{ color: "red" }}> *</span></Form.Label>
                                <Form.Select
                                    value={formData.requiredIngredients[0].requiredAmountUnit}
                                    onChange={(e) => {
                                        const updatedIngredients = [...formData.requiredIngredients];
                                        updatedIngredients[0].requiredAmountUnit = e.target.value;
                                        setField("requiredAmountUnit", e.target.value);
                                    }}
                                    required
                                    isInvalid={validated && !formData.requiredIngredients[0].requiredAmountUnit}
                                >
                                    <option value={"ml"}>ml</option>
                                    <option value={"dl"}>dl</option>
                                    <option value={"l"}>l</option>
                                    <option value={"g"}>g</option>
                                    <option value={"mg"}>dkg</option>
                                    <option value={"kg"}>kg</option>
                                    <option value={"tsp"}>tsp</option>
                                    <option value={"tbsp"}>tbsp</option>
                                    <option value={"fl oz"}>fl oz</option>
                                    <option value={"c"}>c</option>
                                    <option value={"pt"}>pt</option>
                                    <option value={"qt"}>qt</option>
                                    <option value={"gal"}>gal</option>
                                    <option value={"lb"}>lb</option>
                                    <option value={"oz"}>oz</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    This field is required
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row justify-content-between align-items-center w-100">
                        <div>
                            {addRecipeCall.state === 'error' &&
                                <div className="text-danger">Error: {addRecipeCall.error.errorMessage}</div>
                            }
                        </div>
                        <div className="d-flex flex-row gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={addRecipeCall.state === 'pending'}>
                                {addRecipeCall.state === 'pending' ? (
                                    <Icon size={0.8} path={mdiLoading} spin={true} />
                                ) : (
                                    "Create"
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default RecipeForm;