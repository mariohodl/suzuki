import { useState, useCallback, useEffect } from 'react';
import SuzukiLogo from '@/components/SuzukiLogo';
import FaceButton from '@/components/FaceButton';
import StepDots from '@/components/StepDots';
import ThankYouScreen from '@/components/ThankYouScreen';
import Head from 'next/head';

type VisitRating = 'buena' | 'regular' | 'mala' | null;
type ClarityRating = 'muy_claros' | 'regular' | 'nada_claros' | null;
type JoinPromotions = 'si' | 'no' | null;

interface SurveyState {
  step: 0 | 1 | 2 | 3 | 4; // 0=q1, 1=q2, 2=promotions, 3=suggestion, 4=thankyou
  visitSatisfaction: VisitRating;
  clarityOfService: ClarityRating;
  joinPromotions: JoinPromotions;
  suggestion: string;
}

const initialState: SurveyState = {
  step: 0,
  visitSatisfaction: null,
  clarityOfService: null,
  joinPromotions: null,
  suggestion: '',
};

export default function SurveyPage() {
  const [survey, setSurvey] = useState<SurveyState>(initialState);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideDir, setSlideDir] = useState<'in' | 'out'>('in');

  const goToStep = useCallback((nextStep: SurveyState['step']) => {
    setSlideDir('out');
    setIsTransitioning(true);
    setTimeout(() => {
      setSurvey((prev) => ({ ...prev, step: nextStep }));
      setSlideDir('in');
      setIsTransitioning(false);
    }, 280);
  }, []);

  const handleVisitSelect = useCallback(
    (val: VisitRating) => {
      if (isTransitioning) return;
      setSurvey((prev) => ({ ...prev, visitSatisfaction: val }));
      setTimeout(() => goToStep(1), 350);
    },
    [goToStep, isTransitioning]
  );

  const handleClaritySelect = useCallback(
    (val: ClarityRating) => {
      if (isTransitioning) return;
      setSurvey((prev) => ({ ...prev, clarityOfService: val }));
      setTimeout(() => goToStep(2), 350);
    },
    [goToStep, isTransitioning]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitSatisfaction: survey.visitSatisfaction,
          clarityOfService: survey.clarityOfService,
          joinPromotions: survey.joinPromotions,
          suggestion: survey.suggestion,
        }),
      });
    } catch (err) {
      console.error('Error submitting survey:', err);
    } finally {
      setIsSubmitting(false);
      goToStep(4);
    }
  }, [survey, isSubmitting, goToStep]);

  const handleSkipSuggestion = useCallback(() => {
    goToStep(4);
    // Still submit without suggestion
    fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitSatisfaction: survey.visitSatisfaction,
        clarityOfService: survey.clarityOfService,
        joinPromotions: survey.joinPromotions,
        suggestion: '',
      }),
    }).catch(console.error);
  }, [survey]);

  const handleReset = useCallback(() => {
    setSurvey(initialState);
    setSlideDir('in');
  }, []);

  const handlePromotionsSelect = useCallback(
    (val: JoinPromotions) => {
      if (isTransitioning) return;
      setSurvey((prev) => ({ ...prev, joinPromotions: val }));
      setTimeout(() => goToStep(3), 350);
    },
    [goToStep, isTransitioning]
  );

  // Keyboard support for tablets with external keyboard
  useEffect(() => {
    if (survey.step === 3) return;
    const handler = (e: KeyboardEvent) => {
      if (survey.step === 0) {
        if (e.key === '1') handleVisitSelect('buena');
        if (e.key === '2') handleVisitSelect('regular');
        if (e.key === '3') handleVisitSelect('mala');
      }
      if (survey.step === 1) {
        if (e.key === '1') handleClaritySelect('muy_claros');
        if (e.key === '2') handleClaritySelect('regular');
        if (e.key === '3') handleClaritySelect('nada_claros');
      }
      if (survey.step === 2) {
        if (e.key === '1') handlePromotionsSelect('si');
        if (e.key === '2') handlePromotionsSelect('no');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [survey.step, handleVisitSelect, handleClaritySelect, handlePromotionsSelect]);

  if (survey.step === 4) {
    return <ThankYouScreen onReset={handleReset} />;
  }

  return (
    <>
      <Head>
        <title>Encuesta de Satisfacción | Suzuki</title>
        <meta name="description" content="Encuesta de satisfacción Suzuki" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#003087" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Suzuki Encuesta" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      <div
        className="fixed inset-0 flex flex-col"
        style={{ background: '#f0f4f8' }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{
            background: 'white',
            borderBottom: '2px solid #E31837',
            boxShadow: '0 2px 12px rgba(0,48,135,0.08)',
          }}
        >
          <SuzukiLogo size="md" />
          <div className="flex items-center gap-2">
            <div
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: '#f0f4f8', color: '#003087' }}
            >
              Encuesta de Satisfacción
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
          <div
            className={`w-full max-w-3xl flex flex-col items-center ${
              isTransitioning
                ? slideDir === 'out'
                  ? 'slide-out'
                  : 'slide-in'
                : 'slide-in'
            }`}
          >
            {/* Step 1: Visit satisfaction */}
            {survey.step === 0 && (
              <QuestionSlide
                question="¿Qué tan satisfactoria fue tu visita en nuestro concesionario?"
                subtitle="Toca la carita que mejor describe tu experiencia"
              >
                <div className="flex items-center justify-center gap-6 md:gap-10 w-full">
                  <FaceButton
                    mood="happy"
                    label="Buena"
                    selected={survey.visitSatisfaction === 'buena'}
                    onClick={() => handleVisitSelect('buena')}
                  />
                  <FaceButton
                    mood="neutral"
                    label="Regular"
                    selected={survey.visitSatisfaction === 'regular'}
                    onClick={() => handleVisitSelect('regular')}
                  />
                  <FaceButton
                    mood="sad"
                    label="Mala"
                    selected={survey.visitSatisfaction === 'mala'}
                    onClick={() => handleVisitSelect('mala')}
                  />
                </div>
              </QuestionSlide>
            )}

            {/* Step 2: Clarity of service */}
            {survey.step === 1 && (
              <QuestionSlide
                question="¿Fuimos claros al explicarte tu trámite/servicio?"
                subtitle="Selecciona la opción que mejor refleja tu experiencia"
              >
                <div className="flex items-center justify-center gap-6 md:gap-10 w-full">
                  <FaceButton
                    mood="happy"
                    label="Muy claros"
                    selected={survey.clarityOfService === 'muy_claros'}
                    onClick={() => handleClaritySelect('muy_claros')}
                  />
                  <FaceButton
                    mood="neutral"
                    label="Regular"
                    selected={survey.clarityOfService === 'regular'}
                    onClick={() => handleClaritySelect('regular')}
                  />
                  <FaceButton
                    mood="sad"
                    label="Nada claros"
                    selected={survey.clarityOfService === 'nada_claros'}
                    onClick={() => handleClaritySelect('nada_claros')}
                  />
                </div>
              </QuestionSlide>
            )}

            {/* Step 3: Join Promotions */}
            {survey.step === 2 && (
              <QuestionSlide
                question="¿Le gustaría ser parte de nuevos lanzamientos y promociones?"
                subtitle="Selecciona tu preferencia para recibir información"
              >
                <div className="flex items-center justify-center gap-6 md:gap-10 w-full">
                  <FaceButton
                    mood="happy"
                    label="Sí"
                    selected={survey.joinPromotions === 'si'}
                    onClick={() => handlePromotionsSelect('si')}
                  />
                  <FaceButton
                    mood="sad"
                    label="No"
                    selected={survey.joinPromotions === 'no'}
                    onClick={() => handlePromotionsSelect('no')}
                  />
                </div>
              </QuestionSlide>
            )}

            {/* Step 4: Suggestion */}
            {survey.step === 3 && (
              <QuestionSlide
                question="¿Tienes alguna sugerencia para mejorar nuestro servicio?"
                subtitle="Tu opinión es muy importante para nosotros (opcional)"
              >
                <div className="w-full max-w-xl flex flex-col gap-4">
                  <textarea
                    value={survey.suggestion}
                    onChange={(e) =>
                      setSurvey((prev) => ({ ...prev, suggestion: e.target.value }))
                    }
                    placeholder="Escribe aquí tu sugerencia..."
                    maxLength={500}
                    rows={4}
                    className="w-full resize-none rounded-2xl border-2 p-5 text-gray-700 outline-none transition-all duration-200"
                    style={{
                      borderColor: survey.suggestion ? '#003087' : '#CBD5E1',
                      fontSize: 'clamp(15px, 2vw, 18px)',
                      background: 'white',
                      boxShadow: survey.suggestion
                        ? '0 0 0 3px rgba(0,48,135,0.1)'
                        : 'none',
                    }}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <span className="text-sm text-right sm:text-left w-full sm:w-auto" style={{ color: '#94A3B8' }}>
                      {survey.suggestion.length}/500
                    </span>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleSkipSuggestion}
                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 text-center"
                        style={{
                          color: '#003087',
                          background: '#E2E8F0',
                          fontSize: 'clamp(13px, 1.8vw, 16px)',
                        }}
                      >
                        Omitir
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] sm:flex-none px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-70 text-center flex items-center justify-center gap-2"
                        style={{
                          background: isSubmitting
                            ? '#64748B'
                            : 'linear-gradient(135deg, #003087, #0057B8)',
                          fontSize: 'clamp(13px, 1.8vw, 16px)',
                          boxShadow: '0 4px 14px rgba(0,48,135,0.3)',
                        }}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar encuesta →'}
                      </button>
                    </div>
                  </div>
                </div>
              </QuestionSlide>
            )}
          </div>
        </div>

        {/* Footer with step indicators */}
        <div
          className="flex flex-col items-center gap-3 py-5 flex-shrink-0"
          style={{ borderTop: '1px solid #E2E8F0' }}
        >
          <StepDots total={4} current={survey.step} />
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Paso {survey.step + 1} de 4
          </p>
        </div>
      </div>
    </>
  );
}

function QuestionSlide({
  question,
  subtitle,
  children,
}: {
  question: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Question */}
      <div className="text-center space-y-3">
        <h1
          className="font-black leading-tight"
          style={{
            fontSize: 'clamp(22px, 4vw, 42px)',
            color: '#0F172A',
            maxWidth: '700px',
          }}
        >
          {question}
        </h1>
        <p
          className="font-medium"
          style={{
            fontSize: 'clamp(13px, 1.8vw, 17px)',
            color: '#64748B',
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Answer options */}
      {children}
    </div>
  );
}
