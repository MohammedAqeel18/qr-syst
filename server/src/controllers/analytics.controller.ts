
import type { RequestHandler } from "express";
import { ScanEventModel } from "../models/scanEvent.model.js";
import { QRCodeModel } from "../models/qrcode.model.ts";
export const getAnalyticsSummary: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $facet: {
          total: [
            { $count: "count" }
          ],

  
          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 }
              }
            }
          ],

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


export const getQRCodeAnalytics: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { qrId } = req.params;

    if (typeof qrId !== "string" || !/^[a-f0-9]{32}$/i.test(qrId)) {
      res.status(400).json({
        success: false,
        message: "Invalid QR code ID."
      });
      return;
    }


    const qrCode = await QRCodeModel.findOne({ qrId }).lean();

    if (!qrCode) {
      res.status(404).json({
        success: false,
        message: "QR code not found."
      });
      return;
    }

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $match: { qrId }
      },
      {
        $facet: {
          total: [
            { $count: "count" }
          ],
          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 }
              }
            }
          ],
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
        qrCode: {
          qrId: qrCode.qrId,
          name: qrCode.name,
          isActive: qrCode.isActive
        },
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
