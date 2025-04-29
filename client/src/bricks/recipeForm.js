import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { FileUpload } from 'primereact/fileupload';
import { useState } from 'react';

function RecipeForm({ show, setAddRecipeShow, onComplete, recipeListCall, ingredientListCall }) {
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
    const [invalidFile, setInvalidFile] = useState(false);

    const recipeList = recipeListCall.state === "success" ? recipeListCall.data : [];
    const ingredientList = ingredientListCall.state === "success" ? ingredientListCall.data : [];

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

    const handleNewRow = () => {
        const updatedIngredients = [...formData.requiredIngredients, {
            id: "",
            requiredAmountValue: null,
            requiredAmountUnit: "g"
        }];
        setFormData((prevFormData) => ({
            ...prevFormData,
            requiredIngredients: updatedIngredients
        }));
    }

    const handleAmountUpdate = (e, idx) => {
        const updatedIngredients = [...formData.requiredIngredients];
        updatedIngredients[idx].requiredAmountValue = parseFloat(e.target.value);
        setFormData((prev) => ({ ...prev, requiredIngredients: updatedIngredients }));
    }

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
                                (validated && recipeList.find((rec) => rec.name === formData.name))
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && "This field is required"}
                            {validated && recipeList.find((rec) => rec.name === formData.name)
                                && "This recipe already exists"}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Image<span style={{ color: "red" }}> *</span></Form.Label>
                        <div>
                            <Button variant="success">
                                <FileUpload
                                    name="image"
                                    mode="basic"
                                    chooseLabel={formData.image || "Upload"}
                                    url="http://localhost:8000/images"
                                    accept="image/*"
                                    maxFileSize={730000}
                                    auto={true}
                                    onUpload={(e) => {
                                        const response = e.xhr.response ? JSON.parse(e.xhr.response) : {};
                                        if (response.filename) {
                                            setField("image", response.filename);
                                            setInvalidFile(false);
                                        }
                                    }}
                                    onSelect={(e) => {
                                        const file = e.files[0];
                                        if (file) {
                                            if (!file.type.startsWith("image/")) {
                                                setField("image", "");
                                                setInvalidFile(true);
                                            }
                                        }
                                    }}
                                />
                            </Button>
                        </div>
                        <div className="Invalid-feedback">
                            {validated && !formData.image && !invalidFile && "Please upload an image"}
                            {validated && !formData.image && invalidFile && "File must be an image"}
                        </div>
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Preparation process<span style={{ color: "red" }}> *</span></Form.Label>
                        <textarea
                            name="preparationProcess"
                            className="Preparation-container"
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
                        <Row style={{ height: 32 }}>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>
                                    Name<span style={{ color: "red" }}> *</span>
                                </Form.Label>
                            </Form.Group>

                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>
                                    Value<span style={{ color: "red" }}> *</span>
                                </Form.Label>
                            </Form.Group>

                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>
                                    Unit<span style={{ color: "red" }}> *</span>
                                </Form.Label>
                            </Form.Group>
                        </Row>
                        {formData.requiredIngredients.map((ing, idx) => (
                            <Row key={idx}>
                                <Form.Group as={Col} className="mb-3">
                                    <div>
                                        <Form.Select
                                            value={ing.id}
                                            onChange={(e) => {
                                                const updatedIngredients = [...formData.requiredIngredients];
                                                updatedIngredients[idx].id = e.target.value;
                                                setFormData((prev) => ({ ...prev, requiredIngredients: updatedIngredients }));
                                            }}
                                            required
                                            isInvalid={validated && !formData.requiredIngredients[idx].id}
                                        >
                                            <option value={""}>Select an ingredient</option>

                                            {ingredientList.map((ing) => {
                                                const name = ing.name;
                                                const id = ing.id;

                                                return (
                                                    <option value={id}>{name}</option>
                                                );
                                            })}
                                        </Form.Select>
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        No ingredient selected
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Control
                                        type="number"
                                        value={formData.requiredIngredients[idx].requiredAmountValue}
                                        onChange={(e) => {
                                            handleAmountUpdate(e, idx);
                                        }}
                                        onBlur={(e) => {
                                            let value = e.target.value;
                                            if (value.length > 7) {
                                                e.target.value = value.slice(0, 7);
                                                handleAmountUpdate(e, idx);
                                            }
                                        }}
                                        min={0.001}
                                        step={0.001}
                                        required
                                        isInvalid={validated && !formData.requiredIngredients[idx].requiredAmountValue}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Input a valid number
                                        <br></br>
                                        (0,001—9999999)
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Select
                                        value={formData.requiredIngredients[idx].requiredAmountUnit}
                                        onChange={(e) => {
                                            const updatedIngredients = [...formData.requiredIngredients];
                                            updatedIngredients[idx].requiredAmountUnit = e.target.value;
                                            setFormData((prev) => ({ ...prev, requiredIngredients: updatedIngredients }));
                                        }}
                                        required
                                        isInvalid={validated && !formData.requiredIngredients[idx].requiredAmountUnit}
                                    >
                                        <option value={"ml"}>ml</option>
                                        <option value={"dl"}>dl</option>
                                        <option value={"l"}>l</option>
                                        <option value={"g"}>g</option>
                                        <option value={"dkg"}>dkg</option>
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
                        ))}
                        <div className="Align-center">
                            <Button variant="success" onClick={handleNewRow} >
                                New ingredient
                            </Button>
                        </div>
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