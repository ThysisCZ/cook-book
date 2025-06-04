import { useEffect } from 'react';
import Form from 'react-bootstrap/Form';

export function ImageUpload({ imagePreview, setImagePreview, setFormData, setInvalidFile, url }) {
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setInvalidFile(true);
            e.target.value = '';
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setInvalidFile(false);
        setImagePreview(URL.createObjectURL(file));
        setFormData(formData => ({ ...formData, imageFile: file }));
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                data-testid="recipe-image-input"
            />
            {imagePreview && (
                <div className="mt-2">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                </div>
            )}
            {url && (
                <Form.Text className="text-muted">
                    Images will be uploaded to {url}
                </Form.Text>
            )}
        </Form.Group>
    );
}
