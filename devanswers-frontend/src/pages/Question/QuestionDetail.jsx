import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { FaRobot } from 'react-icons/fa';

import { fetchQuestionById } from '../../reducers/questionSlice.js';
import { selectIsAuthenticated } from '../../reducers/userSlice.js';
import { summarizeAnswers } from '../../services/geminiService.js';
import QuestionContent from '../../components/Question/QuestionContent.jsx';
import AnswerList from '../../components/Answer/AnswerList.jsx';
import AnswerForm from '../../components/Answer/AnswerForm.jsx';
import './QuestionDetail.css';

const MIN_ANSWERS_FOR_SUMMARY = 3;

const QuestionDetail = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const { currentQuestion, loading, error } = useSelector((state) => state.question);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestionById(id));
    setSummary(null);
  }, [id, dispatch]);

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const text = await summarizeAnswers(
        currentQuestion.title,
        currentQuestion.description,
        currentQuestion.answers,
      );
      setSummary(text);
    } catch (e) {
      console.error('Summary failed:', e);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="qd-loading-container">
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="qd-loading-container">
        <p>Error loading question: {error}</p>
      </Container>
    );
  }

  if (!currentQuestion) {
    return (
      <Container className="qd-loading-container">
        <p>Question not found.</p>
      </Container>
    );
  }

  const showSummarizeButton =
    isAuthenticated &&
    !summary &&
    (currentQuestion.answers?.length ?? 0) >= MIN_ANSWERS_FOR_SUMMARY;

  return (
    <Container className="qd-container">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <QuestionContent
            question={currentQuestion}
          />

          {showSummarizeButton && (
            <div className="qd-summarize-bar">
              <Button
                variant="outline-primary"
                className="qd-summarize-btn"
                onClick={handleSummarize}
                disabled={summaryLoading}
              >
                {summaryLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FaRobot className="me-2" />
                    Summarize Answers
                  </>
                )}
              </Button>
            </div>
          )}

          {summary && (
            <Alert
              variant="info"
              dismissible
              onClose={() => setSummary(null)}
              className="qd-summary-alert"
            >
              <Alert.Heading className="qd-summary-heading">
                <FaRobot className="me-2" />
                AI Answer Summary
              </Alert.Heading>
              <p className="mb-0 qd-summary-text">{summary}</p>
            </Alert>
          )}

          <AnswerList
            answers={currentQuestion.answers}
          />

          <AnswerForm
            questionId={id}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionDetail;
