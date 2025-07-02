import { Modal, Form, Button, Col, Row } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../services/api';
import { FileUpload } from 'primereact/fileupload';
import { imageService } from '../services/ImageService';

function RecipeAddForm({ show, setAddRecipeShow, onComplete, recipeListCall, ingredientListCall }) {
    const defaultForm = {
        name: "",
        image: "",
        imageFile: null,
        preparationProcess: "",
        requiredIngredients: [
            {
                id: "",
                requiredAmountValue: "",
                requiredAmountUnit: "g"
            }
        ]
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [addRecipeCall, setAddRecipeCall] = useState({ state: "inactive" });
    const [invalidFile, setInvalidFile] = useState(false);
    const [duplicateIngredients, setDuplicateIngredients] = useState([]);
    const fileUploadRef = useRef(null);

    const recipeList = recipeListCall.state === "success" ? recipeListCall.data : [];
    const ingredientList = ingredientListCall.state === "success" ? ingredientListCall.data : [];

    const handleClose = () => {
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
        setFormData(defaultForm);
        setValidated(false);
        setAddRecipeShow(false);
        setInvalidFile(false);
    };

    const setField = (name, val) => {
        setFormData(formData => ({ ...formData, [name]: val }));
    };

    useEffect(() => {
        return () => {
            if (formData.image && formData.image.startsWith('blob:')) {
                URL.revokeObjectURL(formData.image);
            }
        };
    }, [formData.image]);

    useEffect(() => {
        const ids = formData.requiredIngredients.map(ing => ing.id);
        const duplicates = ids.map((id, idx) => ids.indexOf(id) !== idx ? idx : null);
        setDuplicateIngredients(duplicates);
    }, [formData.requiredIngredients]); const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValidated(true);

        if (!e.target.checkValidity()) return;
        if (invalidFile || !formData.imageFile) return;

        try {
            setAddRecipeCall({ state: "pending" });

            // First save the image and get the result
            const imageResult = await imageService.saveImage(formData.imageFile);

            const payload = { ...formData };
            payload.image = imageResult; // Use the saved image data
            delete payload.imageFile; // Remove the file object

            // Convert numeric values
            payload.requiredIngredients = payload.requiredIngredients.map(ing => ({
                ...ing,
                requiredAmountValue: Math.max(0, parseFloat(ing.requiredAmountValue) || 0)
            }));

            const data = await fetchApi("recipe/create", {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            onComplete(data);
            setFormData(defaultForm);
            setValidated(false);
            setAddRecipeShow(false);
            setAddRecipeCall({ state: "inactive" });
        } catch (err) {
            console.error(err);
            setAddRecipeCall({ state: "error", error: err });
        }
    };

    const handleNewRow = () => {
        const updatedIngredients = [...formData.requiredIngredients, {
            id: "",
            requiredAmountValue: "",
            requiredAmountUnit: "g"
        }];
        setFormData(prevFormData => ({
            ...prevFormData,
            requiredIngredients: updatedIngredients
        }));
    }; const handleAmountUpdate = (e, idx) => {
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
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create recipe</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Name<span style={{ color: "red" }}> *</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setField("name", e.target.value);
                                const isDuplicate = recipeList.find(rec => rec.name === e.target.value);
                                e.target.setCustomValidity(isDuplicate ? "Duplicate" : "");
                            }}
                            maxLength={20}
                            required
                            isInvalid={validated && formData.name.length === 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && "This field is required"}
                            {validated && recipeList.find(rec => rec.name === formData.name) && "This recipe already exists"}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Image<span style={{ color: "red" }}> *</span></Form.Label>
                        <div>
                            <Button variant="success">                                <FileUpload
                                name="image"
                                mode="basic" chooseLabel={formData.imageFile ? formData.imageFile.name : "Upload"}
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
                        <Form.Control.Feedback type="invalid" style={{ display: (validated && !formData.imageFile) || invalidFile ? 'block' : 'none' }}>
                            {validated && !formData.imageFile && "Please upload an image"}
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
                                        <option value={"pc"}>pc</option>
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
                                {addRecipeCall.state === "error" && (
                                    <div className="text-danger">Error: {addRecipeCall.error.message}</div>
                                )}
                            </div>
                            <div className="d-flex flex-row gap-2">
                                <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={addRecipeCall.state === "pending"}>
                                    {addRecipeCall.state === "pending" ? (
                                        <Icon size={0.8} path={mdiLoading} spin={true} />
                                    ) : (
                                        "Create"
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

export default RecipeAddForm;