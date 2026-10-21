
import type { RequestHandler } from "express";
import { ScanEventModel } from "../models/scanEvent.model.js";

export const getAnalyticsSummary: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    // Start at midnight UTC, six days before today.
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $facet: {
          // Count every scan recorded so far.
          total: [
            { $count: "count" }
          ],

          // Count scans by detected device type.
          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 }
              }
            }
          ],

          // Count scans per day for the last seven calendar days.
          daily: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC"
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ]
        }
      }
    ]);

    const deviceCounts: Record<string, number> = {
      ios: 0,
      android: 0,
      other: 0
    };

    for (const item of result?.byDevice ?? []) {
      deviceCounts[item._id] = item.count;
    }

    res.status(200).json({
      success: true,
      data: {
        totalScans: result?.total[0]?.count ?? 0,
        iosScans: deviceCounts.ios,
        androidScans: deviceCounts.android,
        otherScans: deviceCounts.other,
        dailyScans: (result?.daily ?? []).map(
          (item: { _id: string; count: number }) => ({
            date: item._id,
            count: item.count
          })
        )
      }
    });
  } catch (error) {
    next(error);
  }
};
