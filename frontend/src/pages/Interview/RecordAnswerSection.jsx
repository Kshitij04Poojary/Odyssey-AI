import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Mic, StopCircle } from 'lucide-react';
import useSpeechToText from 'react-hook-speech-to-text';
import axios from 'axios';
import { chatSession } from '../../configs/GeminiAiModel';
import { toast } from 'react-toastify';
import webcamImage from '../../assets/webcam.png';

const RecordAnswerSection = ({ activeQuestionIndex, mockInterviewQuestion, interviewData }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results?.forEach((result) => {
            setUserAnswer((prevAns) => prevAns + result?.transcript);
        });
    }, [results]);

    useEffect(() => {
        if (!isRecording && userAnswer?.length > 10) {
            updateUserAnswer();
        }
    }, [userAnswer]);

    const startStopRecording = () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    };

    const updateUserAnswer = async () => {
        try {
            setLoading(true);
            const questionText = mockInterviewQuestion[activeQuestionIndex]?.question;
            const feedbackPrompt = `Question: ${questionText}, User Answer: ${userAnswer}. Depending on the question and answer, please provide a rating and feedback (3-5 lines) in JSON format with 'rating' and 'feedback' fields.`;

            const result = await chatSession.sendMessage(feedbackPrompt);
            const mockJsonResp = result.response.text().replace('```json', '').replace('```', '');
            const jsonFeedbackResp = JSON.parse(mockJsonResp);
            console.log(jsonFeedbackResp)
            const userAnswerData = {
                mockIdRef: interviewData?._id,
                question: questionText,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: jsonFeedbackResp?.feedback,
                rating: jsonFeedbackResp?.rating,
                userId:interviewData?.user,
            };

            // Send data to backend
            const response = await axios.post('http://localhost:8000/api/interview/user-answer', userAnswerData);

            if (response.status === 201) {
                toast.success('User Answer recorded successfully');
                setUserAnswer('');
                setResults([]);
            }
        } catch (error) {
            console.error('Error updating user answer:', error);
            toast.error('Failed to record answer');
        } finally {
            setResults([]);
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-4 flex items-center justify-center flex-col space-y-6">
            <div className="relative w-full max-w-md bg-gray-500 rounded-2xl shadow-xl overflow-hidden">
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <img 
                        src={webcamImage} 
                        alt="Webcam Icon" 
                        className="w-1/2 h-1/2 object-contain" 
                    />
                </div>
                <div className="relative z-10">
                    <Webcam 
                        mirrored 
                        className="w-full h-[350px] object-cover rounded-2xl" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-center w-full space-x-4">
                <button 
                    disabled={loading} 
                    onClick={startStopRecording}
                    className={`
                        px-6 py-3 rounded-full font-semibold transition-all duration-300 
                        flex items-center gap-2 cursor-pointer 
                        ${isRecording 
                            ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {isRecording ? (
                        <>
                            <StopCircle className="w-5 h-5" />
                            Stop Recording
                        </>
                    ) : (
                        <>
                            <Mic className="w-5 h-5" />
                            Record Answer
                        </>
                    )}
                </button>

                {userAnswer && !isRecording && (
                    <button 
                        onClick={() => {
                            setUserAnswer('');
                            setResults([]);
                        }}
                        className="
                            px-6 py-3 rounded-full font-semibold 
                            bg-gray-200 text-gray-700 
                            hover:bg-gray-300 
                            transition-all duration-300 
                            cursor-pointer
                        "
                    >
                        Clear Answer
                    </button>
                )}
            </div>
        </div>
    );
};

export default RecordAnswerSection;