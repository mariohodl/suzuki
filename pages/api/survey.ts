import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import SurveyResponse from '@/lib/models/SurveyResponse';

type ResponseData = {
  success: boolean;
  message?: string;
  data?: object;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { visitSatisfaction, clarityOfService, suggestion, branch } = req.body;

    if (!visitSatisfaction || !clarityOfService) {
      return res.status(400).json({
        success: false,
        message: 'Los campos visitSatisfaction y clarityOfService son requeridos',
      });
    }

    const survey = new SurveyResponse({
      visitSatisfaction,
      clarityOfService,
      suggestion: suggestion || '',
      branch: branch || 'Principal',
    });

    await survey.save();

    return res.status(201).json({
      success: true,
      message: 'Encuesta guardada exitosamente',
      data: survey,
    });
  } catch (error) {
    console.error('Error saving survey:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}
