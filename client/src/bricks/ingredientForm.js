import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import { useState } from 'react';

function IngredientForm({ ingredient, show, setAddIngredientShow, setReload, onComplete }) {
    const defaultForm = {
        name: "",
        amountValue: null,
        amountUnit: "g"
    };

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [addIngredientCall, setAddIngredientCall] = useState({
        state: 'inactive'
    });

    const handleClose = () => {
        setFormData(defaultForm);
        setValidated(false);
        setAddIngredientShow(false);
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

        setAddIngredientCall({ state: "pending" });

        try {
            const res = await fetch(`http://localhost:8000/ingredient/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.status >= 400) {
                setAddIngredientCall({ state: "error", error: data });
            } else {
                setAddIngredientCall({ state: "success", data });
                if (typeof onComplete === "function") {
                    onComplete(data.ingredient);
                }
                handleClose();
                setReload(true);
            }
        } catch (err) {
            setAddIngredientCall({ state: "error", error: { errorMessage: err.message } });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Create Ingredient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setField("name", e.target.value)}
                            maxLength={20}
                            required
                            isInvalid={formData.name.length > 20}
                        />
                        <Form.Control.Feedback type="invalid">
                            This field is required
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Amount value</Form.Label>
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
                                isInvalid={formData.amountValue < 0.001 && formData.amountValue !== null}
                            />
                            <Form.Control.Feedback type="invalid">
                                Input a valid number
                                <br></br>
                                (0.001—9999999)
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3">
                            <Form.Label>Amount unit</Form.Label>
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
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex flex-row justify-content-between align-items-center w-100">
                        <div>
                            {addIngredientCall.state === 'error' &&
                                <div className="text-danger">Error: {addIngredientCall.error.errorMessage}</div>
                            }
                        </div>
                        <div className="d-flex flex-row gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={addIngredientCall.state === 'pending'}>
                                {addIngredientCall.state === 'pending' ? (
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

export default IngredientForm;