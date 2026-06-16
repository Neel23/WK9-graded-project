import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaPaperPlane, FaRobot, FaCheck, FaTimes } from 'react-icons/fa';

import { postQuestion } from '../../reducers/questionSlice.js';
import { improveQuestion } from '../../services/geminiService.js';

import { Col, Container, Form, Button, Card, Row, Spinner } from 'react-bootstrap';
import './PostQuestion.css';

const SuggestionBox = ({ text, onAccept, onReject }) => (
  <div className="pq-suggestion-box mt-2">
    <div className="pq-suggestion-label">
      <FaRobot className="me-1" /> AI Suggestion
    </div>
    <div className="pq-suggestion-text">{text}</div>
    <div className="pq-suggestion-actions">
      <Button size="sm" variant="success" className="pq-suggestion-btn" onClick={onAccept}>
        <FaCheck className="me-1" /> Accept
      </Button>
      <Button size="sm" variant="outline-secondary" className="pq-suggestion-btn" onClick={onReject}>
        <FaTimes className="me-1" /> Reject
      </Button>
    </div>
  </div>
);

const PostQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [suggestions, setSuggestions] = useState({ title: null, description: null, tags: null });
  const [aiLoading, setAiLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(postQuestion({ title, description, tags }));

      if (postQuestion.fulfilled.match(result)) {
        const newQuestion = result.payload;
        alert('Question posted successfully!');
        navigate(`/question/${newQuestion._id}`);
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question. Please try again.');
    }
  };

  const handleImproveWithAI = async () => {
    setAiLoading(true);
    try {
      const improved = await improveQuestion(title, description, tags);
      setSuggestions({ title: improved.title ?? null, description: improved.description ?? null, tags: improved.tags ?? null });
    } catch (error) {
      console.error('AI improvement failed:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = (field) => {
    if (field === 'title') setTitle(suggestions.title);
    if (field === 'description') setDescription(suggestions.description);
    if (field === 'tags') setTags(suggestions.tags);
    setSuggestions((prev) => ({ ...prev, [field]: null }));
  };

  const rejectSuggestion = (field) => {
    setSuggestions((prev) => ({ ...prev, [field]: null }));
  };

  const hasContent = title.trim() || description.trim() || tags.trim();

  return (
    <Container className="py-3 px-2 py-sm-4 px-sm-3 pq-page-container">
      <Row className="justify-content-center">
         <Col xs={12} lg={10} xl={9}>
            <Card className="mb-4 pq-header-card">
              <Card.Body className="p-3 p-sm-4">
                  <Card.Title as="h2" className="pq-title">
                    Ask a Question
                  </Card.Title>
                  <p className="text-muted mb-0">Be specific and imagine you're asking another person</p>
              </Card.Body>
            </Card>

            <Card className="pq-body-card">
              <Card.Body className="p-3 p-sm-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="title" className="pq-label">
                      Title
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's your programming question?"
                      required
                      className="pq-input"
                    />
                    {suggestions.title && (
                      <SuggestionBox
                        text={suggestions.title}
                        onAccept={() => acceptSuggestion('title')}
                        onReject={() => rejectSuggestion('title')}
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="description" className="pq-label">
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more details about your question..."
                      rows={10}
                      required
                      className="pq-textarea"
                    />
                    {suggestions.description && (
                      <SuggestionBox
                        text={suggestions.description}
                        onAccept={() => acceptSuggestion('description')}
                        onReject={() => rejectSuggestion('description')}
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="tags" className="pq-label">
                      Tags (comma-separated)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="tags"
                      name="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., javascript, react, css"
                      className="pq-input"
                    />
                    <Form.Text className="text-muted">
                      Add up to 5 tags to describe what your question is about
                    </Form.Text>
                    {suggestions.tags && (
                      <SuggestionBox
                        text={suggestions.tags}
                        onAccept={() => acceptSuggestion('tags')}
                        onReject={() => rejectSuggestion('tags')}
                      />
                    )}
                  </Form.Group>

                  <div className="d-flex flex-column gap-3">
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="lg"
                      className="w-100 pq-ai-btn"
                      onClick={handleImproveWithAI}
                      disabled={aiLoading || !hasContent}
                    >
                      {aiLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Getting suggestions...
                        </>
                      ) : (
                        <>
                          <FaRobot className="me-2" />
                          Improve with AI
                        </>
                      )}
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 pq-btn"
                    >
                      <FaPaperPlane className="me-2" />
                      Post Question
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </Container>
  );
};

export default PostQuestion;
