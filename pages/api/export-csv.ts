import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import SurveyResponse from '@/lib/models/SurveyResponse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { password, branch, dateRange } = req.query;

  if (password !== process.env.SUPER_PASS) {
    return res.status(401).send('No autorizado: Contraseña incorrecta');
  }

  try {
    await connectDB();

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

    const responses = await SurveyResponse.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV contents
    // UTF-8 BOM so Excel opens it with correct accents
    let csvContent = '\uFEFF';
    
    // Header
    csvContent += 'Fecha,Sucursal,Satisfacción de Visita,Claridad del Servicio,¿Unirse a Promociones?,Sugerencias\n';

    // Rows
    responses.forEach((r: any) => {
      const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString('es-MX') : '';
      const branchStr = r.branch || 'Principal';
      const visitStr = r.visitSatisfaction || '';
      const clarityStr = r.clarityOfService || '';
      const promotionsStr = r.joinPromotions === 'si' ? 'Sí' : r.joinPromotions === 'no' ? 'No' : '';
      // Escape double quotes and wrap in quotes to preserve formatting
      const suggestionStr = r.suggestion ? `"${r.suggestion.replace(/"/g, '""')}"` : '""';

      csvContent += `${dateStr},"${branchStr}","${visitStr}","${clarityStr}","${promotionsStr}",${suggestionStr}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-encuestas-suzuki.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error generating CSV:', error);
    return res.status(500).send('Error interno del servidor al generar CSV');
  }
}
