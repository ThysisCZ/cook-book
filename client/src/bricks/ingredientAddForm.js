import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useState } from 'react';
import { fetchApi } from '../services/api';

function IngredientAddForm({ show, setAddIngredientShow, onComplete, ingredientListCall, isCzech }) {
    const defaultForm = {
        name: "",
        amountValue: "", // Changed from null to empty string
        amountUnit: "g"
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [addIngredientCall, setAddIngredientCall] = useState({ state: "inactive" });

    const ingredientList = ingredientListCall.state === "success" ? ingredientListCall.data : [];

    const handleClose = () => {
        setFormData(defaultForm);
        setValidated(false);
        setAddIngredientShow(false);
    };

    const setField = (name, val) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValidated(true);

        if (!e.target.checkValidity()) return;

        // Validate number fields before submission
        const amountValue = parseFloat(formData.amountValue);
        if (isNaN(amountValue) || amountValue < 0.001 || amountValue > 9999999) {
            return;
        }

        try {
            setAddIngredientCall({ state: "pending" });

            // Ensure data is properly formatted before sending
            const submitData = {
                ...formData,
                amountValue: amountValue,
                name: formData.name.trim()
            }; const data = await fetchApi("ingredients/create", {
                method: 'POST',
                body: JSON.stringify(submitData)
            });
            onComplete(data);
            setFormData(defaultForm);
            setValidated(false);
            setAddIngredientShow(false);
            setAddIngredientCall({ state: "inactive" });
        } catch (err) {
            console.error(err);
            setAddIngredientCall({ state: "error", error: err });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>
                        {isCzech ? "Vytvořit Ingredienci" : "Create Ingredient"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {isCzech ? "Název" : "Name"}
                            <span style={{ color: "red" }}> *</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setField("name", e.target.value);
                                const isDuplicate = ingredientList.find(
                                    (ing) => ing.name.toLowerCase() === e.target.value.toLowerCase()
                                );
                                e.target.setCustomValidity(isDuplicate ? "Duplicate" : "");
                            }}
                            maxLength={20}
                            required
                            isInvalid={
                                (validated && formData.name.length === 0) ||
                                (validated && ingredientList.find((ing) => ing.name.toLowerCase() === formData.name.toLowerCase()))
                            }
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && (isCzech ? "Toto pole je povinné" : "This field is required")}
                            {validated && ingredientList.find((ing) => ing.name.toLowerCase() === formData.name.toLowerCase())
                                && (isCzech ? "Tato ingredience již existuje" : "This ingredient already exists")}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>
                                {isCzech ? "Hodnota" : "Value"}
                                <span style={{ color: "red" }}> *</span>
                            </Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.amountValue}
                                onChange={(e) => { setField("amountValue", parseFloat(e.target.value)); }}
                                onBlur={(e) => {
                                    let value = e.target.value;
                                    if (value.length > 7) {
                                        e.target.value = value.slice(0, 7);
                                        setField("amountValue", parseFloat(e.target.value));
                                    }
                                }}
                                min={0}
                                step={0.001}
                                required
                                isInvalid={validated && formData.amountValue < 0}
                            />
                            <Form.Control.Feedback type="invalid">
                                {isCzech ? "Zadejte validní číslo" : "Input a valid number"}
                                <br></br>
                                (0—9999999)
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>
                                {isCzech ? "Jednotka" : "Unit"}
                                <span style={{ color: "red" }}> *</span></Form.Label>
                            <Form.Select
                                value={formData.amountUnit}
                                onChange={(e) => {
                                    setField("amountUnit", e.target.value);
                                }}
                                required
                            >
                                <option value={"ml"}>ml</option>
                                <option value={"dl"}>dl</option>
                                <option value={"l"}>l</option>
                                <option value={"g"}>g</option>
                                <option value={"dkg"}>dkg</option>
                                <option value={"kg"}>kg</option>
                                <option value={"tsp/ČL"}>
                                    {isCzech ? "ČL" : "tsp"}
                                </option>
                                <option value={"tbsp/PL"}>
                                    {isCzech ? "PL" : "tsp"}
                                </option>
                                <option value={"fl oz"}>fl oz</option>
                                <option value={"pc/ks"}>
                                    {isCzech ? "ks" : "pc"}
                                </option>
                                <option value={"c/hrn"}>
                                    {isCzech ? "hrn" : "c"}
                                </option>
                                <option value={"pt"}>pt</option>
                                <option value={"qt"}>qt</option>
                                <option value={"gal"}>gal</option>
                                <option value={"lb"}>lb</option>
                                <option value={"oz"}>oz</option>
                            </Form.Select>
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                            {addIngredientCall.state === "error" && (
                                <div className="text-danger">
                                    Error: {addIngredientCall.error.message}
                                </div>
                            )}
                        </div>
                        <div>
                            <Button variant="secondary" onClick={handleClose} className="me-2">
                                {isCzech ? "Zrušit" : "Cancel"}
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={addIngredientCall.state === "pending"}
                            >
                                {addIngredientCall.state === "pending" ? (
                                    <Icon size={0.8} path={mdiLoading} spin={true} />
                                ) : (
                                    isCzech ? "Vytvořit" : "Create"
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default IngredientAddForm;