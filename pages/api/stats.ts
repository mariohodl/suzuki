import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import SurveyResponse from '@/lib/models/SurveyResponse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const total = await SurveyResponse.countDocuments();
    const visitStats = await SurveyResponse.aggregate([
      { $group: { _id: '$visitSatisfaction', count: { $sum: 1 } } },
    ]);
    const clarityStats = await SurveyResponse.aggregate([
      { $group: { _id: '$clarityOfService', count: { $sum: 1 } } },
    ]);
    const recent = await SurveyResponse.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: { total, visitStats, clarityStats, recent },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
