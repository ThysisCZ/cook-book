import { Modal, Form, Button, Col, Row } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../services/api';
import { FileUpload } from 'primereact/fileupload';
import { imageService } from '../services/ImageService';

function RecipeEditForm({ show, setEditRecipeShow, onComplete, ingredientListCall, recipe }) {
    const defaultForm = {
        name: "",
        image: "",
        imageFile: null,
        preparationProcess: "",
        requiredIngredients: [{
            id: "",
            requiredAmountValue: "",
            requiredAmountUnit: "g"
        }],
        id: ""
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [editRecipeCall, setEditRecipeCall] = useState({ state: "inactive" });
    const [invalidFile, setInvalidFile] = useState(false);
    const [duplicateIngredients, setDuplicateIngredients] = useState([]);
    const fileUploadRef = useRef(null);

    const ingredientList = ingredientListCall.state === "success" ? ingredientListCall.data : [];

    // Update form data when recipe changes or modal is shown
    useEffect(() => {
        if (show && recipe) {
            setFormData({
                name: recipe.name || "",
                image: recipe.image || "",
                imageFile: null,
                preparationProcess: recipe.preparationProcess || "",
                requiredIngredients: (recipe.requiredIngredients || []).map(ing => ({
                    ...ing,
                    requiredAmountValue: ing.requiredAmountValue?.toString() || ""
                })),
                id: recipe.id || ""
            });
        }
    }, [recipe, show]);

    const handleClose = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
        setFormData(defaultForm);
        setValidated(false);
        setEditRecipeShow(false);
        setInvalidFile(false);
    };

    const setField = (name, val) => {
        setFormData(formData => ({ ...formData, [name]: val }));
    };

    // Check duplicate ingredients
    useEffect(() => {
        const ids = formData.requiredIngredients
            .filter(ing => ing.id) // Only check ingredients that have been selected
            .map(ing => ing.id);
        const duplicates = ids.map((id, idx) => ids.indexOf(id) !== idx ? idx : null);
        setDuplicateIngredients(duplicates);
    }, [formData.requiredIngredients]); const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValidated(true);

        if (!e.target.checkValidity()) return;
        if (invalidFile) return;

        try {
            setEditRecipeCall({ state: "pending" });

            const payload = { ...formData };

            // Only handle image if a new one was uploaded
            if (formData.imageFile) {
                const imageResult = await imageService.saveImage(formData.imageFile);
                payload.image = imageResult;
                delete payload.imageFile;
            }

            // Convert numeric values
            payload.requiredIngredients = payload.requiredIngredients.map(ing => ({
                ...ing,
                requiredAmountValue: Math.max(0, parseFloat(ing.requiredAmountValue) || 0)
            }));

            const data = await fetchApi(`recipes/update?id=${formData.id}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            onComplete(data);
            setValidated(false);
            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
            }
            setEditRecipeShow(false);
            setEditRecipeCall({ state: "inactive" });
        } catch (err) {
            console.error(err);
            setEditRecipeCall({ state: "error", error: err });
        }
    }

    const handleNewRow = () => {
        const updatedIngredients = [...formData.requiredIngredients, {
            id: "",
            requiredAmountValue: "",
            requiredAmountUnit: "g"
        }];
        setFormData((prevFormData) => ({
            ...prevFormData,
            requiredIngredients: updatedIngredients
        }));
    };

    const handleAmountUpdate = (e, idx) => {
        const value = e.target.value;
        if (value === '' || value === '-') {
            const updatedIngredients = [...formData.requiredIngredients];
            updatedIngredients[idx].requiredAmountValue = "";
            setFormData(prev => ({ ...prev, requiredIngredients: updatedIngredients }));
            return;
        }

        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.length <= 7) {
            const updatedIngredients = [...formData.requiredIngredients];
            updatedIngredients[idx].requiredAmountValue = numValue > 0 ? value : "";
            setFormData(prev => ({ ...prev, requiredIngredients: updatedIngredients }));
        }
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit recipe</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name<span style={{ color: "red" }}> *</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setField("name", e.target.value)}
                            maxLength={20}
                            required
                            isInvalid={validated && formData.name.length === 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && "This field is required"}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Image<span style={{ color: "red" }}> *</span></Form.Label>
                        <div>
                            <Button variant="success">
                                <FileUpload
                                    ref={fileUploadRef}
                                    mode="basic"
                                    chooseLabel={formData.imageFile ? formData.imageFile.name : "Upload"}
                                    accept="image/*"
                                    maxFileSize={2000000}
                                    auto={true}
                                    customUpload={true}
                                    onSelect={async (e) => {
                                        const file = e.files[0];
                                        if (file) {
                                            if (!file.type.startsWith("image/")) {
                                                setField("imageFile", null);
                                                setField("image", "");
                                                setInvalidFile(true);
                                            } else {
                                                const imageResult = await imageService.saveImage(file);
                                                setField("imageFile", file);
                                                setField("image", imageResult);
                                                setInvalidFile(false);
                                            }
                                        }
                                    }}
                                />
                            </Button>
                        </div>
                        {formData.image && (
                            <div style={{ marginTop: '0.25rem' }}>
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{ maxWidth: '100px', marginTop: '0.5rem' }}
                                    onError={() => {
                                        setField("imageFile", null);
                                        setField("image", "");
                                        setInvalidFile(true);
                                    }}
                                />
                            </div>
                        )}
                        <Form.Control.Feedback type="invalid" style={{ display: (validated && !formData.image) || invalidFile ? 'block' : 'none' }}>
                            {validated && !formData.image && "Please upload an image"}
                            {invalidFile && "Please upload a valid image file"}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Preparation process<span style={{ color: "red" }}> *</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            style={{ minHeight: 100 }}
                            value={formData.preparationProcess}
                            onChange={(e) => setField("preparationProcess", e.target.value)}
                            maxLength={4000}
                            required
                            isInvalid={validated && formData.preparationProcess.length === 0}
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
                                    <Form.Select
                                        value={ing.id}
                                        onChange={(e) => {
                                            const updatedIngredients = [...formData.requiredIngredients];
                                            updatedIngredients[idx].id = e.target.value;
                                            setFormData((prev) => ({ ...prev, requiredIngredients: updatedIngredients }));

                                            if (!formData.requiredIngredients[idx].id) {
                                                e.target.setCustomValidity("No ingredient");
                                            } else if (updatedIngredients.filter((ing) => ing.id === e.target.value).length > 1) {
                                                e.target.setCustomValidity("Duplicate")
                                            } else {
                                                e.target.setCustomValidity("")
                                            }
                                        }}
                                        required
                                        isInvalid={validated && !formData.requiredIngredients[idx].id}
                                    >
                                        <option value={""}>Select an ingredient</option>

                                        {ingredientList.map((ing) => {
                                            const name = ing.name;
                                            const id = ing.id;

                                            return (
                                                <option key={id} value={id}>{name}</option>
                                            );
                                        })}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {validated && !formData.requiredIngredients[idx].id && "No ingredient selected"}
                                        {validated && formData.requiredIngredients[idx].id && duplicateIngredients.includes(idx) && "Duplicate ingredient"}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Control
                                        type="number"
                                        value={
                                            isNaN(formData.requiredIngredients[idx].requiredAmountValue)
                                                ? ""
                                                : formData.requiredIngredients[idx].requiredAmountValue
                                        }
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

                    <Modal.Footer>
                        <div className="d-flex flex-row justify-content-between align-items-center w-100">
                            <div>
                                {editRecipeCall.state === "error" && (
                                    <div className="text-danger">Error: {editRecipeCall.error.message}</div>
                                )}
                            </div>
                            <div className="d-flex flex-row gap-2">
                                <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={editRecipeCall.state === "pending"}>
                                    {editRecipeCall.state === "pending" ? (
                                        <Icon size={0.8} path={mdiLoading} spin={true} />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default RecipeEditForm;