import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import SurveyResponse from '@/lib/models/SurveyResponse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { password, branch, dateRange } = req.body;

  if (password !== process.env.SUPER_PASS) {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
  }

  try {
    await connectDB();

    // 1. Build Query Filters
    const query: any = {};

    if (branch && branch !== 'all') {
      query.branch = branch;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === '7d') {
        query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      } else if (dateRange === '30d') {
        query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      }
    }

    // 2. Fetch distinct branches for the selector
    const allBranches = await SurveyResponse.distinct('branch');
    const branchesList = allBranches.filter(Boolean); // Remove null/undefined

    // 3. Main queries with filters
    const total = await SurveyResponse.countDocuments(query);

    // Aggregate Visit Satisfaction
    const visitStatsRaw = await SurveyResponse.aggregate([
      { $match: query },
      { $group: { _id: '$visitSatisfaction', count: { $sum: 1 } } }
    ]);

    // Aggregate Clarity of Service
    const clarityStatsRaw = await SurveyResponse.aggregate([
      { $match: query },
      { $group: { _id: '$clarityOfService', count: { $sum: 1 } } }
    ]);

    // Get Suggestions
    const recentSuggestions = await SurveyResponse.find({
      ...query,
      suggestion: { $ne: '', $exists: true }
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // 4. Format Statistics
    // Ensure all options are represented even if they have 0 count
    const visitStats = ['buena', 'regular', 'mala'].map(key => {
      const match = visitStatsRaw.find(item => item._id === key);
      return {
        _id: key,
        count: match ? match.count : 0
      };
    });

    const clarityStats = ['muy_claros', 'regular', 'nada_claros'].map(key => {
      const match = clarityStatsRaw.find(item => item._id === key);
      return {
        _id: key,
        count: match ? match.count : 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        visitStats,
        clarityStats,
        recent: recentSuggestions,
        branches: branchesList
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
