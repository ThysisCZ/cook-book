import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useState } from 'react';

function IngredientEditForm({ show, setEditIngredientShow, onComplete, ingredient }) {
    const defaultForm = {
        name: ingredient?.name || "",
        amountValue: ingredient?.amountValue || null,
        amountUnit: ingredient?.amountUnit || "g",
        id: ingredient?.id || ""
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [editIngredientCall, setEditIngredientCall] = useState({ state: "inactive" });

    const handleClose = () => {
        setFormData(defaultForm);
        setValidated(false);
        setEditIngredientShow(false);
    };

    const setField = (name, val) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async (e) => {
        const form = e.currentTarget;

        e.preventDefault();
        e.stopPropagation();

        if (!form.checkValidity()) {
            setValidated(true);
            return;
        }

        const payload = {
            ...formData
        };

        setEditIngredientCall({ state: "pending" });

        try {
            const res = await fetch(`http://localhost:8000/ingredient/update?id=${formData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.status >= 400) {
                setEditIngredientCall({ state: "error", error: data });
            } else {
                setEditIngredientCall({ state: "success", data });
                onComplete(data.ingredient);
                handleClose();
            }
        } catch (err) {
            setEditIngredientCall({ state: "error", error: { errorMessage: err.message } });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Ingredient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name<span style={{ color: "red" }}> *</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setField("name", e.target.value);
                            }}
                            maxLength={20}
                            required
                            isInvalid={validated && formData.name.length === 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validated && formData.name.length === 0 && "This field is required"}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Amount value<span style={{ color: "red" }}> *</span></Form.Label>
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
                            <Form.Label>Amount unit<span style={{ color: "red" }}> *</span></Form.Label>
                            <Form.Select
                                value={formData.amountUnit}
                                onChange={(e) => setField("amountUnit", e.target.value)}
                                required
                                isInvalid={!formData.amountUnit}
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
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row justify-content-between align-items-center w-100">
                        <div>
                            {editIngredientCall.state === "error" &&
                                <div className="text-danger">Error: {editIngredientCall.error.errorMessage}</div>
                            }
                        </div>
                        <div className="d-flex flex-row gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={editIngredientCall.state === 'pending'}>
                                {editIngredientCall.state === "pending" ? (
                                    <Icon size={0.8} path={mdiLoading} spin={true} />
                                ) : (
                                    "Edit"
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default IngredientEditForm;